// Store mapping of userId -> Set of socket IDs for user sessions
const userSockets = new Map();

let sessionIO = null;

/**
 * Initialize Session Socket.IO namespace (separate namespace on existing io instance)
 * Can be used for both admin and student users
 * @param {Server} io - Socket.IO server instance (shared with game sockets)
 */
const initializeSessionSocketIO = (io) => {
    // Use /session namespace on the existing io instance
    sessionIO = io.of('/session');

    sessionIO.on('connection', (socket) => {
        console.log(`[Session Socket.IO] Client connected: ${socket.id}`);

        // Handle user authentication (works for both admin and students)
        socket.on('authenticate', (userId) => {
            if (!userId) {
                console.log(`[Session Socket.IO] Authentication failed: No userId provided`);
                return;
            }

            // Add socket to user's socket set
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            // Store userId in socket for cleanup
            socket.userId = userId;

            console.log(`[Session Socket.IO] User ${userId} authenticated with socket ${socket.id}`);
            console.log(`[Session Socket.IO] User ${userId} now has ${userSockets.get(userId).size} active connections`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[Session Socket.IO] Client disconnected: ${socket.id}`);

            // Remove socket from user's socket set
            if (socket.userId) {
                const sockets = userSockets.get(socket.userId);
                if (sockets) {
                    sockets.delete(socket.id);

                    // If user has no more sockets, remove from map
                    if (sockets.size === 0) {
                        userSockets.delete(socket.userId);
                        console.log(`[Session Socket.IO] User ${socket.userId} has no more active connections`);
                    } else {
                        console.log(`[Session Socket.IO] User ${socket.userId} still has ${sockets.size} active connections`);
                    }
                }
            }
        });
    });

    console.log('[Session Socket.IO] Server initialized on /session namespace');
    return sessionIO;
};

/**
 * Emit force-logout event to all sockets of a specific user
 * Works for both admin and student users
 * @param {string} userId - User ID (admin or student)
 */
const forceLogoutUser = (userId) => {
    if (!sessionIO) {
        console.error('[Session Socket.IO] Server not initialized');
        return;
    }

    const sockets = userSockets.get(userId);
    if (!sockets || sockets.size === 0) {
        console.log(`[Session Socket.IO] No active connections for user ${userId}`);
        return;
    }

    console.log(`[Session Socket.IO] Emitting 'force-logout' to ${sockets.size} socket(s) of user ${userId}`);

    sockets.forEach(socketId => {
        sessionIO.to(socketId).emit('force-logout', {
            message: 'Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.'
        });
    });
};

/**
 * Get Session Socket.IO namespace instance
 */
const getSessionIO = () => sessionIO;

module.exports = {
    initializeSessionSocketIO,
    forceLogoutUser,
    getSessionIO
};
