// Debug Config Loading
console.log('🔌 Loading JWT Config from Env:', {
    WEB_ACCESS: process.env.JWT_WEB_EXPIRES_IN,
    WEB_REFRESH: process.env.JWT_WEB_REFRESH_EXPIRES_IN
});

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m', // APP: Access token default
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // APP: Refresh token default

    // WEB ADMIN specific configs
    JWT_WEB_EXPIRES_IN: process.env.JWT_WEB_EXPIRES_IN || '15m',
    JWT_WEB_REFRESH_EXPIRES_IN: process.env.JWT_WEB_REFRESH_EXPIRES_IN || '1h'
};