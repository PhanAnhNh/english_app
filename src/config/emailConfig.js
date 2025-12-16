const nodemailer = require('nodemailer');
// Sử dụng dotenv để đọc biến môi trường từ .env nếu chạy local
// Nếu chạy trên Render, các biến này sẽ được đọc từ Environment Variables
require('dotenv').config();

const config = {
    // 💡 Đơn giản nhất và chuẩn nhất: dùng 'gmail' service
    // Nó tự động chọn Port 465/587 và cấu hình TLS phù hợp
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    family: 4,

    logger: true,
    debug: true
};

console.log('--- Email Config Check (Render) ---');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('Secure (SSL/TLS):', config.secure);
console.log('Connection Timeout:', config.connectionTimeout + 'ms');
console.log('User:', config.auth.user ? config.auth.user : 'Missing');
console.log('Pass:', config.auth.pass ? 'Set' : 'Missing');
console.log('-----------------------------------');

const transporter = nodemailer.createTransport(config);

module.exports = transporter;