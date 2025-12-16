const nodemailer = require('nodemailer');
require('dotenv').config();

const port = parseInt(process.env.EMAIL_PORT) || 465; // Mặc định dùng 465 (SSL)
const secure = port === 465; // true nếu 465, false nếu 587

const config = {
    // Render hoặc Cloud Host thường chặn port mặc định, nên cần config thủ công
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Tăng thời gian chờ và log debug
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    logger: true, // Log to console
    debug: true   // Include SMTP traffic in logs
};

console.log('--- Email Config Check ---');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('Secure:', config.secure);
console.log('User:', config.auth.user ? 'Set' : 'Missing');
console.log('Pass:', config.auth.pass ? 'Set' : 'Missing');
console.log('--------------------------');

const transporter = nodemailer.createTransport(config);

module.exports = transporter;
