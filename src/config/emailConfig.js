const nodemailer = require('nodemailer');
require('dotenv').config();

const config = {
    // Render hoặc Cloud Host thường chặn port mặc định, nên cần config thủ công
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587, // Port 587 thường ổn định hơn trên Cloud
    secure: process.env.EMAIL_PORT == 465, // true nếu dùng port 465
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
