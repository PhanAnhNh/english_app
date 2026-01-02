// socket/socketManager.js
const Exercise = require('../model/Exercise');
const Match = require('../model/Matches');
const matchService = require('../service/matchService');

// Biến lưu trữ trạng thái game trên RAM
let waitingQueue = [];
let activeRooms = {};

const QUESTION_TIME_LIMIT = 10; // 10 giây mỗi câu
const FIND_MATCH_TIMEOUT = 5000; // 5 giây không thấy ai thì gặp Bot

// Cấu hình Bot mặc định
const BOT_PROFILE = {
    userId: 'BOT_ID',
    socketId: 'BOT_SOCKET', // Fake Socket ID để quản lý trong room
    username: 'Mr. Robot 🤖',
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png', // Ảnh Bot
    level: 'ANY',
    score: 0,
    correctCount: 0,
    hasAnsweredCurrent: false
};

module.exports = (io) => {

    // ==========================================
    // 1. HÀM HỖ TRỢ BOT & LOGIC GAME
    // ==========================================

    // Hàm tạo trận đấu với Bot
    const createBotMatch = async (socket, user) => {
        console.log(`🤖 Đang tạo trận với Bot cho user: ${user.username}`);

        // Setup Player 1 (User thật)
        const player1 = { ...user, score: 0, correctCount: 0, hasAnsweredCurrent: false };
        // Setup Player 2 (Bot) - Clone để không bị tham chiếu
        const player2 = { ...BOT_PROFILE, level: user.level };

        const roomId = `match_${player1.userId}_BOT`;
        socket.join(roomId);

        // Lấy câu hỏi
        let questions = await Exercise.aggregate([
            { $match: { level: user.level, mode: 'pvp', isActive: true } },
            { $sample: { size: user.questionCount } }
        ]);

        // Fallback nếu thiếu câu hỏi
        if (questions.length === 0) {
            questions = await Exercise.aggregate([
                { $match: { mode: 'pvp', isActive: true } },
                { $sample: { size: user.questionCount } }
            ]);
        }

        // Lưu Match vào DB (đánh dấu player2 là 'BOT')
        const newMatch = await Match.create({
            player1: player1.userId,
            player2: null, // Hoặc để null, hoặc lưu string 'BOT' tùy schema của bạn
            questions: questions.map(q => ({ questionId: q._id, correctAnswer: q.correctAnswer })),
            status: 'playing',
            startTime: new Date()
        });

        // Khởi tạo Room RAM
        activeRooms[roomId] = {
            matchId: newMatch._id,
            targetLevel: user.level,
            currentQuestionIndex: 0,
            questionStartTime: 0,
            timer: null,
            players: {
                [player1.socketId]: player1,
                [player2.socketId]: player2 // Thêm Bot vào list
            },
            questions: questions
        };

        // Báo cho Client
        io.to(roomId).emit('match_found', {
            roomId,
            matchId: newMatch._id,
            player1,
            player2
        });

        // Bắt đầu câu 1
        setTimeout(() => nextQuestion(roomId), 3000);
    };

    // Hàm giả lập Bot trả lời
    const triggerBotAnswer = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        // Chỉ chạy nếu trong phòng có Bot
        const botId = 'BOT_SOCKET';
        if (!room.players[botId]) return;

        // 1. Random thời gian trả lời (từ 2s đến 8s)
        const delay = Math.floor(Math.random() * 6000) + 2000;

        // 2. Random tỷ lệ đúng (70%)
        const isCorrectGuess = Math.random() < 0.7;

        setTimeout(() => {
            if (!activeRooms[roomId]) return; // Room có thể đã đóng

            const botPlayer = activeRooms[roomId].players[botId];
            if (botPlayer.hasAnsweredCurrent) return;

            botPlayer.hasAnsweredCurrent = true;
            const currentQ = activeRooms[roomId].questions[activeRooms[roomId].currentQuestionIndex];

            // Tính điểm giả lập
            let points = 0;
            const isReallyCorrect = isCorrectGuess; // Giả sử bot chọn đáp án đúng/sai dựa trên tỷ lệ

            if (isReallyCorrect) {
                botPlayer.correctCount++;
                const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - (delay / 1000));
                points = 10 + Math.floor(timeRemaining);
            }

            botPlayer.score += points;

            // Gửi thông báo cho User thật biết đối thủ (Bot) đã trả lời
            io.to(roomId).emit('opponent_progress', {
                opponentId: botPlayer.userId,
                scoreAdded: points, // Ẩn điểm nếu muốn
                currentScore: botPlayer.score
            });

            // Kiểm tra next câu
            checkAndNextQuestion(roomId);

        }, delay);
    };

    // Hàm kiểm tra chung xem tất cả player đã trả lời chưa
    const checkAndNextQuestion = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        const allPlayers = Object.values(room.players);
        const allAnswered = allPlayers.every(p => p.hasAnsweredCurrent);

        if (allAnswered) {
            if (room.timer) clearTimeout(room.timer);
            // Delay 1s rồi chuyển câu
            setTimeout(() => {
                if (activeRooms[roomId]) {
                    activeRooms[roomId].currentQuestionIndex++;
                    nextQuestion(roomId);
                }
            }, 1000);
        }
    };

    // Hàm chuyển câu hỏi (Dùng chung cho cả PvP người và Bot)
    const nextQuestion = async (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        // Check hết game
        if (room.currentQuestionIndex >= room.questions.length) {
            await finishGame(roomId);
            return;
        }

        // Reset trạng thái trả lời
        Object.keys(room.players).forEach(socketId => {
            room.players[socketId].hasAnsweredCurrent = false;
        });

        const currentQ = room.questions[room.currentQuestionIndex];

        // Ẩn đáp án đúng khi gửi về client
        const questionForClient = { ...currentQ, correctAnswer: undefined };

        io.to(roomId).emit('next_question', {
            questionIndex: room.currentQuestionIndex + 1,
            totalQuestions: room.questions.length,
            content: questionForClient,
            timeLimit: QUESTION_TIME_LIMIT,
            startTime: Date.now()
        });

        room.questionStartTime = Date.now();

        // **QUAN TRỌNG: Kích hoạt Bot trả lời (nếu có Bot trong phòng)**
        triggerBotAnswer(roomId);

        // Timer server (timeout câu hỏi)
        if (room.timer) clearTimeout(room.timer);
        room.timer = setTimeout(() => {
            handleTimeout(roomId);
        }, (QUESTION_TIME_LIMIT + 1) * 1000);
    };

    const handleTimeout = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        console.log(`⏰ Room ${roomId}: Hết giờ câu ${room.currentQuestionIndex + 1}`);
        io.to(roomId).emit('time_up', {
            correctAnswer: room.questions[room.currentQuestionIndex].correctAnswer
        });

        room.currentQuestionIndex++;
        setTimeout(() => nextQuestion(roomId), 2000);
    };

    const finishGame = async (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;
        if (room.timer) clearTimeout(room.timer);

        const playerIds = Object.keys(room.players);

        // Lưu kết quả (Service đã chặn lưu Bot)
        await Promise.all(playerIds.map(async (socketId) => {
            const player = room.players[socketId];
            await matchService.saveMatchResultDirectly(
                player.userId,
                room.matchId,
                player.score,
                player.correctCount
            );
        }));

        // Update Match DB
        await Match.findByIdAndUpdate(room.matchId, {
            status: 'finished',
            endTime: new Date()
        });

        io.to(roomId).emit('game_finished', {
            players: room.players
        });

        delete activeRooms[roomId];
        console.log(`🏁 Room ${roomId} finished.`);
    };

    // ==========================================
    // 2. SOCKET EVENTS
    // ==========================================

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // --- JOIN QUEUE ---
        socket.on('join_queue', async (userData) => {
            const { userId, username, avatarUrl, level, questionCount } = userData;
            const targetLevel = level || 'A1';
            const targetCount = questionCount || 5;

            // Check duplicate
            if (waitingQueue.find(user => user.userId === userId)) return;

            const currentUser = {
                socketId: socket.id,
                userId, username, avatarUrl,
                level: targetLevel,
                questionCount: targetCount,
                // Timer chờ ghép Bot
                botTimeout: null
            };



            // 1. Tìm đối thủ NGƯỜI THẬT
            const opponentIndex = waitingQueue.findIndex(user =>
                user.level === targetLevel && user.userId !== userId
            );

            if (opponentIndex !== -1) {
                // --> TÌM THẤY NGƯỜI
                const opponent = waitingQueue.splice(opponentIndex, 1)[0];

                // Hủy timer bot của đối thủ vì đã tìm thấy người
                if (opponent.botTimeout) clearTimeout(opponent.botTimeout);

                const player1 = currentUser;
                const player2 = opponent;
                const roomId = `match_${player1.userId}_${player2.userId}`;

                const socket1 = io.sockets.sockets.get(player1.socketId);
                const socket2 = io.sockets.sockets.get(player2.socketId);

                if (socket1 && socket2) {
                    socket1.join(roomId);
                    socket2.join(roomId);

                    // Lấy câu hỏi
                    let questions = await Exercise.aggregate([
                        { $match: { level: targetLevel, mode: 'pvp', isActive: true } },
                        { $sample: { size: targetCount } }
                    ]);

                    // Tạo Match DB
                    const newMatch = await Match.create({
                        player1: player1.userId,
                        player2: player2.userId,
                        questions: questions.map(q => ({ questionId: q._id, correctAnswer: q.correctAnswer })),
                        status: 'playing',
                        startTime: new Date()
                    });

                    // Init Room
                    activeRooms[roomId] = {
                        matchId: newMatch._id,
                        targetLevel,
                        currentQuestionIndex: 0,
                        questionStartTime: 0,
                        timer: null,
                        players: {
                            [player1.socketId]: { ...player1, score: 0, correctCount: 0, hasAnsweredCurrent: false },
                            [player2.socketId]: { ...player2, score: 0, correctCount: 0, hasAnsweredCurrent: false }
                        },
                        questions: questions
                    };

                    io.to(roomId).emit('match_found', {
                        roomId, matchId: newMatch._id, player1, player2
                    });

                    setTimeout(() => nextQuestion(roomId), 3000);
                    console.log(`✅ PvP Room ${roomId} started.`);
                }
            } else {
                // --> KHÔNG THẤY AI: Thêm vào hàng chờ và set Timeout gọi Bot

                currentUser.botTimeout = setTimeout(() => {
                    // 1. Xóa khỏi hàng chờ
                    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
                    // 2. Tạo trận với Bot
                    createBotMatch(socket, currentUser);
                }, FIND_MATCH_TIMEOUT); // 5000ms

                waitingQueue.push(currentUser);
            }
        });

        // --- SUBMIT ANSWER ---
        socket.on('submit_answer', (data) => {
            const { roomId, answer } = data;
            const room = activeRooms[roomId];
            if (!room || !room.players[socket.id]) return;

            const player = room.players[socket.id];
            if (player.hasAnsweredCurrent) return;

            player.hasAnsweredCurrent = true;

            // Tính điểm
            const currentQ = room.questions[room.currentQuestionIndex];
            const isCorrect = answer === currentQ.correctAnswer;
            let points = 0;

            if (isCorrect) {
                player.correctCount++;
                const now = Date.now();
                const timeElapsed = (now - room.questionStartTime) / 1000;
                const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - timeElapsed);
                points = 10 + Math.floor(timeRemaining);
            }
            player.score += points;

            // Emit kết quả cá nhân
            socket.emit('answer_result', {
                isCorrect,
                correctAnswer: currentQ.correctAnswer,
                scoreAdded: points,
                currentScore: player.score
            });

            // Emit tiến trình cho đối thủ (kể cả Bot cũng nhận, nhưng Bot ko xử lý, chỉ Client nhận)
            socket.to(roomId).emit('opponent_progress', {
                opponentId: player.userId,
                scoreAdded: points,
                currentScore: player.score
            });

            // Check xem chuyển câu được chưa
            checkAndNextQuestion(roomId);
        });

        // --- DISCONNECT ---
        socket.on('disconnect', async () => {
            // 1. Xử lý hàng chờ: Nếu đang chờ mà thoát thì xóa timeout Bot
            const waitingUser = waitingQueue.find(u => u.socketId === socket.id);
            if (waitingUser) {
                if (waitingUser.botTimeout) clearTimeout(waitingUser.botTimeout);
                waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
            }

            // 2. Xử lý đang chơi (giữ logic cũ)
            for (const [roomId, room] of Object.entries(activeRooms)) {
                if (room.players[socket.id]) {
                    if (room.timer) clearTimeout(room.timer);

                    // Báo đối thủ thắng
                    socket.to(roomId).emit('opponent_disconnected', {
                        message: 'Đối thủ đã thoát. Bạn thắng!'
                    });

                    // Nếu đấu với Bot, Bot không cần báo user thoát, nhưng cứ end game
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