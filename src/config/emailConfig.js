const nodemailer = require('nodemailer');
// Sử dụng dotenv để đọc biến môi trường từ .env nếu chạy local
// Nếu chạy trên Render, các biến này sẽ được đọc từ Environment Variables
require('dotenv').config();

// --- Cấu hình Cổng và Biến Môi trường ---
// Gmail mặc định và khuyến nghị sử dụng Port 465 (Implicit SSL/TLS)
const port = parseInt(process.env.EMAIL_PORT) || 465;
const isSSL = port === 465; // Đặt secure: true cho port 465

// --- Cấu hình chính thức cho Transporter ---
const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    // TRUE cho cổng 465 (SSL), FALSE cho cổng 587 (STARTTLS)
    secure: isSSL,
    auth: {
        // EMAIL_USER: Địa chỉ Gmail của bạn
        user: process.env.EMAIL_USER,
        // EMAIL_PASS: Mật khẩu Ứng dụng (App Password)
        pass: process.env.EMAIL_PASS
    },

    // --- Khắc phục lỗi Connection Timeout ---
    // Tăng thời gian chờ kết nối lên 15-20 giây
    connectionTimeout: 20000,
    socketTimeout: 20000,

    // --- Khắc phục lỗi SSLv3 và Chứng chỉ ---
    tls: {
        // Loại bỏ yêu cầu SSLv3 lỗi thời, để Node.js/Nodemailer tự chọn TLS hiện đại
        // Nếu bạn gặp lỗi chứng chỉ trên Render, giữ rejectUnauthorized: false.
        rejectUnauthorized: false
        // Đã loại bỏ 'ciphers: isSSL ? 'SSLv3' : undefined'
    },

    // Đã loại bỏ 'family: 4' để cho phép sử dụng cả IPv4 và IPv6

    // --- Gỡ lỗi (Debug) ---
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