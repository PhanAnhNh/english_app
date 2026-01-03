// socket/socketManager.js
const Exercise = require('../model/Exercise');
const Match = require('../model/Matches');
const matchService = require('../service/matchService');

// ==========================================
// CONFIG & STATE
// ==========================================

// Biến lưu trữ trạng thái game trên RAM
let waitingQueue = [];
let activeRooms = {};

const QUESTION_TIME_LIMIT = 10; // 10 giây mỗi câu
const FIND_MATCH_TIMEOUT = 5000; // 5 giây không thấy ai thì gặp Bot
const ROUND_RESULT_DURATION = 3000; // 3 giây hiển thị kết quả mỗi vòng

// Cấu hình Bot mặc định
const BOT_PROFILE = {
    userId: 'BOT_ID',
    socketId: 'BOT_SOCKET', // Fake Socket ID
    username: 'Mr. Robot 🤖',
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
    level: 'ANY',
    score: 0,
    correctCount: 0,
    hasAnsweredCurrent: false,
    roundPoints: 0 // [MỚI] Lưu điểm nhận được trong câu hiện tại
};

module.exports = (io) => {

    // ==========================================
    // 1. CORE GAME LOGIC
    // ==========================================

    /**
     * [MỚI] Gửi kết quả vòng đấu (Round) cho tất cả người chơi trong phòng.
     * Hàm này được gọi khi tất cả đã trả lời xong hoặc hết giờ.
     */
    const sendRoundResult = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        // Xóa timer đếm ngược câu hỏi cũ
        if (room.timer) clearTimeout(room.timer);

        const currentQ = room.questions[room.currentQuestionIndex];

        // Chuẩn bị dữ liệu bảng điểm của vòng này
        const playersResult = Object.values(room.players).map(p => ({
            userId: p.userId,
            socketId: p.socketId,
            username: p.username,
            avatarUrl: p.avatarUrl,
            totalScore: p.score,       // Tổng điểm hiện tại
            addedScore: p.roundPoints, // Điểm cộng thêm ở câu này (để client hiển thị hiệu ứng +10)
            isCorrect: p.roundPoints > 0 // Logic đơn giản: có điểm là đúng
        }));

        // Gửi sự kiện cho client hiển thị Popup kết quả
        io.to(roomId).emit('round_result', {
            correctAnswer: currentQ.correctAnswer,
            players: playersResult,
            nextQuestionIn: ROUND_RESULT_DURATION / 1000 // Báo client đếm ngược (ví dụ 3s)
        });

        // Đợi 3s rồi chuyển câu mới
        setTimeout(() => {
            // Kiểm tra lại phòng còn tồn tại không (phòng khi user thoát hết)
            if (activeRooms[roomId]) {
                activeRooms[roomId].currentQuestionIndex++;
                nextQuestion(roomId);
            }
        }, ROUND_RESULT_DURATION);
    };

    /**
     * Chuyển sang câu hỏi tiếp theo
     */
    const nextQuestion = async (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        // 1. Kiểm tra kết thúc game
        if (room.currentQuestionIndex >= room.questions.length) {
            await finishGame(roomId);
            return;
        }

        // 2. Reset trạng thái cho câu hỏi mới
        Object.keys(room.players).forEach(socketId => {
            room.players[socketId].hasAnsweredCurrent = false;
            room.players[socketId].roundPoints = 0; // Reset điểm vòng
        });

        const currentQ = room.questions[room.currentQuestionIndex];

        // 3. Chuẩn bị dữ liệu (ẩn đáp án đúng)
        const questionForClient = { ...currentQ, correctAnswer: undefined };

        // 4. Gửi câu hỏi mới
        io.to(roomId).emit('next_question', {
            questionIndex: room.currentQuestionIndex + 1,
            totalQuestions: room.questions.length,
            content: questionForClient,
            timeLimit: QUESTION_TIME_LIMIT,
            startTime: Date.now(),
            players: Object.values(room.players).map(p => ({
                userId: p.userId,
                score: p.score
            }))
        });

        room.questionStartTime = Date.now();

        // 5. Kích hoạt Bot (nếu có)
        triggerBotAnswer(roomId);

        // 6. Set timer hết giờ (Server side timeout)
        if (room.timer) clearTimeout(room.timer);
        room.timer = setTimeout(() => {
            handleTimeout(roomId);
        }, (QUESTION_TIME_LIMIT + 1) * 1000); // Thêm 1s buffer mạng
    };

    /**
     * Xử lý khi hết thời gian câu hỏi
     */
    const handleTimeout = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        console.log(`⏰ Room ${roomId}: Time out câu ${room.currentQuestionIndex + 1}`);

        // Force các player chưa trả lời thành đã trả lời (với 0 điểm)
        Object.values(room.players).forEach(p => {
            if (!p.hasAnsweredCurrent) {
                p.hasAnsweredCurrent = true;
                p.roundPoints = 0;
            }
        });

        // Gọi màn hình kết quả thay vì nextQuestion ngay
        sendRoundResult(roomId);
    };

    /**
     * Kiểm tra xem mọi người đã trả lời xong chưa
     */
    const checkAndNextQuestion = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;

        const allPlayers = Object.values(room.players);
        const allAnswered = allPlayers.every(p => p.hasAnsweredCurrent);

        if (allAnswered) {
            // Delay nhỏ 0.5s để UI client kịp hiển thị animation chọn đáp án của chính mình
            // sau đó mới hiện bảng tổng kết
            if (room.timer) clearTimeout(room.timer);
            setTimeout(() => {
                sendRoundResult(roomId);
            }, 500);
        }
    };

    /**
     * Logic Bot trả lời tự động
     */
    const triggerBotAnswer = (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;
        const botId = 'BOT_SOCKET';
        if (!room.players[botId]) return; // Không có bot thì thoát

        // Random delay và độ chính xác
        const delay = Math.floor(Math.random() * 6000) + 2000; // 2s - 8s
        const isCorrectGuess = Math.random() < 0.7; // 70% đúng

        setTimeout(() => {
            if (!activeRooms[roomId]) return;
            const botPlayer = activeRooms[roomId].players[botId];

            // Nếu bot chưa trả lời (có thể user trả lời xong hết trước khi bot kịp trả lời)
            if (!botPlayer.hasAnsweredCurrent) {
                botPlayer.hasAnsweredCurrent = true;

                let points = 0;
                if (isCorrectGuess) {
                    botPlayer.correctCount++;
                    const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - (delay / 1000));
                    points = 10 + Math.floor(timeRemaining);
                }

                botPlayer.score += points;
                botPlayer.roundPoints = points; // [QUAN TRỌNG] Lưu điểm để hiển thị

                // Kiểm tra xem xong hết chưa
                checkAndNextQuestion(roomId);
            }
        }, delay);
    };

    /**
     * Kết thúc game
     */
    const finishGame = async (roomId) => {
        const room = activeRooms[roomId];
        if (!room) return;
        if (room.timer) clearTimeout(room.timer);

        const playerIds = Object.keys(room.players);

        // Lưu kết quả vào DB
        await Promise.all(playerIds.map(async (socketId) => {
            const player = room.players[socketId];
            await matchService.saveMatchResultDirectly(
                player.userId,
                room.matchId,
                player.score,
                player.correctCount
            );
        }));

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

    /**
     * Tạo phòng đấu với Bot
     */
    const createBotMatch = async (socket, user) => {
        console.log(`🤖 Tạo Bot Match cho: ${user.username}`);

        // Init stats
        const player1 = { ...user, score: 0, correctCount: 0, hasAnsweredCurrent: false, roundPoints: 0 };
        const player2 = { ...BOT_PROFILE, level: user.level, roundPoints: 0 };

        const roomId = `match_${player1.userId}_BOT`;
        socket.join(roomId);

        // Lấy câu hỏi
        let questions = await Exercise.aggregate([
            { $match: { level: user.level, mode: 'pvp', isActive: true } },
            { $sample: { size: user.questionCount } }
        ]);

        if (questions.length === 0) {
            questions = await Exercise.aggregate([
                { $match: { mode: 'pvp', isActive: true } },
                { $sample: { size: user.questionCount } }
            ]);
        }

        const newMatch = await Match.create({
            player1: player1.userId,
            player2: null,
            questions: questions.map(q => ({ questionId: q._id, correctAnswer: q.correctAnswer })),
            status: 'playing',
            startTime: new Date()
        });

        activeRooms[roomId] = {
            matchId: newMatch._id,
            targetLevel: user.level,
            currentQuestionIndex: 0,
            questionStartTime: 0,
            timer: null,
            players: {
                [player1.socketId]: player1,
                [player2.socketId]: player2
            },
            questions: questions
        };

        io.to(roomId).emit('match_found', {
            roomId,
            matchId: newMatch._id,
            player1,
            player2
        });

        // Bắt đầu sau 3s
        setTimeout(() => nextQuestion(roomId), 3000);
    };


    // ==========================================
    // 2. SOCKET EVENT HANDLERS
    // ==========================================

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // --- JOIN QUEUE ---
        socket.on('join_queue', async (userData) => {
            const { userId, username, avatarUrl, level, questionCount } = userData;
            const targetLevel = level || 'A1';
            const targetCount = questionCount || 5;

            // Prevent duplicate join
            if (waitingQueue.find(user => user.userId === userId)) return;

            const currentUser = {
                socketId: socket.id,
                userId, username, avatarUrl,
                level: targetLevel,
                questionCount: targetCount,
                botTimeout: null
            };

            // Tìm đối thủ
            const opponentIndex = waitingQueue.findIndex(user =>
                user.level === targetLevel && user.userId !== userId
            );

            if (opponentIndex !== -1) {
                // --> FOUND REAL PLAYER
                const opponent = waitingQueue.splice(opponentIndex, 1)[0];
                if (opponent.botTimeout) clearTimeout(opponent.botTimeout);

                const player1 = { ...currentUser, score: 0, correctCount: 0, hasAnsweredCurrent: false, roundPoints: 0 };
                const player2 = { ...opponent, score: 0, correctCount: 0, hasAnsweredCurrent: false, roundPoints: 0 };

                const roomId = `match_${player1.userId}_${player2.userId}`;
                const socket1 = io.sockets.sockets.get(player1.socketId);
                const socket2 = io.sockets.sockets.get(player2.socketId);

                if (socket1 && socket2) {
                    socket1.join(roomId);
                    socket2.join(roomId);

                    let questions = await Exercise.aggregate([
                        { $match: { level: targetLevel, mode: 'pvp', isActive: true } },
                        { $sample: { size: targetCount } }
                    ]);

                    const newMatch = await Match.create({
                        player1: player1.userId,
                        player2: player2.userId,
                        questions: questions.map(q => ({ questionId: q._id, correctAnswer: q.correctAnswer })),
                        status: 'playing',
                        startTime: new Date()
                    });

                    activeRooms[roomId] = {
                        matchId: newMatch._id,
                        targetLevel,
                        currentQuestionIndex: 0,
                        questionStartTime: 0,
                        timer: null,
                        players: {
                            [player1.socketId]: player1,
                            [player2.socketId]: player2
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
                // --> WAITING FOR OPPONENT
                currentUser.botTimeout = setTimeout(() => {
                    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
                    createBotMatch(socket, currentUser);
                }, FIND_MATCH_TIMEOUT);

                waitingQueue.push(currentUser);
            }
        });

        // --- SUBMIT ANSWER ---
        socket.on('submit_answer', (data) => {
            const { roomId, answer } = data;
            const room = activeRooms[roomId];

            // Validate basic
            if (!room || !room.players[socket.id]) return;
            const player = room.players[socket.id];

            // Nếu đã trả lời rồi thì bỏ qua
            if (player.hasAnsweredCurrent) return;

            player.hasAnsweredCurrent = true;

            // Tính điểm
            const currentQ = room.questions[room.currentQuestionIndex];

            const isCorrect = answer.toString().trim() === currentQ.correctAnswer.toString().trim();
            let points = 0;

            if (isCorrect) {
                player.correctCount++;
                const now = Date.now();
                const timeElapsed = (now - room.questionStartTime) / 1000;
                const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - timeElapsed);
                points = 10 + Math.floor(timeRemaining);
            }

            player.score += points;
            player.roundPoints = points; // Lưu lại để tí nữa gửi round_result

            // 1. Phản hồi NGAY LẬP TỨC cho người bấm (để UI hiện Xanh/Đỏ)
            socket.emit('answer_result', {
                isCorrect,
                correctAnswer: currentQ.correctAnswer, // Có thể gửi luôn hoặc đợi round_result tùy logic client
                scoreAdded: points,
                currentScore: player.score
            });

            // 2. Kiểm tra xem đã đủ điều kiện hiển thị bảng tổng kết chưa
            checkAndNextQuestion(roomId);
        });

        socket.on('leave_room', async ({ roomId }) => {
            const room = activeRooms[roomId];
            if (!room) return;

            console.log(`🏳️ Player ${socket.id} surrendered in room ${roomId}`);

            // Xác định người thua
            const leavingPlayer = room.players[socket.id];
            if (!leavingPlayer) return;

            // Dừng timer
            if (room.timer) clearTimeout(room.timer);

            // Thông báo cho đối thủ
            socket.to(roomId).emit('opponent_disconnected', {
                message: 'Đối thủ đã đầu hàng. Bạn thắng!'
            });

            // Lưu kết quả DB
            for (const p of Object.values(room.players)) {
                await matchService.saveMatchResultDirectly(
                    p.userId,
                    room.matchId,
                    p.score,
                    p.correctCount
                );
            }

            await Match.findByIdAndUpdate(room.matchId, {
                status: 'finished',
                endTime: new Date()
            });

            // Emit kết thúc game cho bên còn lại
            socket.to(roomId).emit('game_finished', {
                reason: 'opponent_surrender'
            });

            delete activeRooms[roomId];
        });


        // --- DISCONNECT ---
        socket.on('disconnect', async () => {
            const waitingUser = waitingQueue.find(u => u.socketId === socket.id);
            if (waitingUser) {
                if (waitingUser.botTimeout) clearTimeout(waitingUser.botTimeout);
                waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
            }

            for (const [roomId, room] of Object.entries(activeRooms)) {
                if (room.players[socket.id]) {
                    if (room.timer) clearTimeout(room.timer);

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