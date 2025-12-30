// socket/socketManager.js
const Question = require('../model/Question');
const Match = require('../model/Matches'); // Đã sửa thành Match (số ít) theo hướng dẫn trước
const MatchResult = require('../model/MatchResult');
const User = require('../model/User');

// Biến lưu trữ trạng thái game trên RAM
// waitingQueue: [ { socketId, userId, level, questionCount, ... } ]
let waitingQueue = [];
let activeRooms = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // --- 1. TÌM TRẬN (NÂNG CẤP) ---
        // Client gửi lên: { userId, ..., level: 'A1', questionCount: 10 }
        socket.on('join_queue', async (userData) => {
            const { userId, username, avatarUrl, level, questionCount } = userData;

            // Mặc định nếu client không gửi thì lấy A1 và 5 câu
            const targetLevel = level || 'A1';
            const targetCount = questionCount || 5;

            // 1. Check duplicate trong hàng đợi
            const isAlreadyInQueue = waitingQueue.find(user => user.userId === userId);
            if (isAlreadyInQueue) return;

            console.log(`🔍 ${username} tìm trận Level: ${targetLevel}, Số câu: ${targetCount}`);

            // 2. Tạo object người chơi hiện tại
            const currentUser = {
                socketId: socket.id,
                userId,
                username,
                avatarUrl,
                level: targetLevel,     // Lưu ý: Đây là level muốn thi đấu
                questionCount: targetCount,
                score: 0
            };

            // 3. Tìm đối thủ phù hợp trong hàng đợi
            // Logic: Tìm người có CÙNG Level và CÙNG số lượng câu hỏi (hoặc chênh lệch ít)
            const opponentIndex = waitingQueue.findIndex(user =>
                user.level === targetLevel &&
                user.userId !== userId // Tránh tự tìm thấy chính mình (nếu lỗi logic)
                // && user.questionCount === targetCount // Có thể bật điều kiện này nếu muốn strict
            );

            if (opponentIndex !== -1) {
                // --- TÌM THẤY ĐỐI THỦ ---
                const opponent = waitingQueue.splice(opponentIndex, 1)[0]; // Lấy đối thủ ra khỏi hàng chờ
                const player1 = currentUser; // Người mới vào là player 1 (hoặc ngược lại tùy bạn)
                const player2 = opponent;

                const roomId = `match_${player1.userId}_${player2.userId}`;

                const socket1 = io.sockets.sockets.get(player1.socketId);
                const socket2 = io.sockets.sockets.get(player2.socketId);

                if (socket1 && socket2) {
                    socket1.join(roomId);
                    socket2.join(roomId);

                    // --- [QUERY DB THÔNG MINH] ---
                    // Chỉ lấy câu hỏi thuộc Level đã chọn và mode phù hợp
                    const questions = await Question.aggregate([
                        {
                            $match: {
                                level: targetLevel,
                                mode: { $in: ['pvp', 'both'] },
                                isActive: true
                            }
                        },
                        { $sample: { size: targetCount } } // Lấy số lượng theo yêu cầu
                    ]);

                    // Nếu kho câu hỏi không đủ, lấy tạm tất cả những gì có
                    if (questions.length === 0) {
                        console.log("⚠️ Không tìm thấy câu hỏi nào cho level này!");
                        // Có thể emit lỗi về client hoặc lấy random level khác để chữa cháy
                    }

                    // Tạo Match trong DB
                    const newMatch = await Match.create({
                        player1: player1.userId,
                        player2: player2.userId,
                        questions: questions.map(q => ({ questionId: q._id, correctAnswer: q.correctAnswer })),
                        status: 'playing',
                        startTime: new Date()
                    });

                    // Lưu vào RAM
                    activeRooms[roomId] = {
                        matchId: newMatch._id,
                        targetLevel: targetLevel, // Lưu lại để debug
                        players: {
                            [player1.socketId]: { ...player1, finished: false },
                            [player2.socketId]: { ...player2, finished: false }
                        },
                        questions: questions,
                        createdAt: new Date()
                    };

                    // Gửi về Client
                    io.to(roomId).emit('match_found', {
                        roomId,
                        matchId: newMatch._id,
                        level: targetLevel,
                        totalQuestions: questions.length,
                        player1: player1,
                        player2: player2,
                        questions: questions // App sẽ hiển thị đúng số lượng này
                    });

                    console.log(`✅ Room ${roomId} started. Level: ${targetLevel}`);
                }
            } else {
                // --- KHÔNG CÓ AI, ĐỨNG CHỜ ---
                waitingQueue.push(currentUser);
                console.log(`⏳ ${username} đang đợi đối thủ Level ${targetLevel}...`);
            }
        });

        // --- 2. TRẢ LỜI CÂU HỎI (Giữ nguyên) ---
        socket.on('submit_answer', (data) => {
            const { roomId, isCorrect } = data;
            const room = activeRooms[roomId];
            if (!room || !room.players[socket.id]) return;

            const points = isCorrect ? 10 : 0;
            room.players[socket.id].score += points;

            socket.to(roomId).emit('opponent_progress', {
                scoreAdded: points,
                currentScore: room.players[socket.id].score,
                opponentId: room.players[socket.id].userId
            });
        });

        // --- 3. KẾT THÚC TRẬN (Sửa chút logic tính điểm correctCount) ---
        socket.on('finish_game', async (data) => {
            const { roomId, timeUsed } = data;
            const room = activeRooms[roomId];
            if (!room || !room.players[socket.id]) return;

            const player = room.players[socket.id];
            if (player.finished) return;
            player.finished = true;

            try {
                // Tính số câu đúng dựa trên điểm số (Giả sử 10 điểm/câu)
                const correctAns = Math.floor(player.score / 10);

                await MatchResult.create({
                    matchId: room.matchId,
                    userId: player.userId,
                    score: player.score,
                    correctCount: correctAns,
                    timeUsed: timeUsed || 0
                });

                // Cộng thưởng
                await User.findByIdAndUpdate(player.userId, {
                    $inc: { xp: player.score, gems: (player.score > 0 ? 5 : 0) }
                });

                // Check xong trận
                const allFinished = Object.values(room.players).every(p => p.finished);
                if (allFinished) {
                    await Match.findByIdAndUpdate(room.matchId, {
                        status: 'finished',
                        endTime: new Date()
                    });
                    delete activeRooms[roomId];
                }
            } catch (err) {
                console.error("Lỗi save game:", err);
            }
        });

        // --- 4. NGẮT KẾT NỐI (Giữ nguyên) ---
        socket.on('disconnect', async () => {
            // Xóa khỏi hàng đợi
            waitingQueue = waitingQueue.filter(user => user.socketId !== socket.id);

            // Xử lý đang chơi mà thoát
            for (const [roomId, room] of Object.entries(activeRooms)) {
                if (room.players[socket.id]) {
                    socket.to(roomId).emit('opponent_disconnected', {
                        message: 'Đối thủ đã thoát. Bạn thắng!'
                    });
                    try {
                        await Match.findByIdAndUpdate(room.matchId, { status: 'finished', endTime: new Date() });
                    } catch (e) { }
                    delete activeRooms[roomId];
                    break;
                }
            }
        });
    });
};