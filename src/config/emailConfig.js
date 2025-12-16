require('dotenv').config();
const nodemailer = require('nodemailer');

// Tạo transporter với thông tin SMTP từ biến môi trường
const config = {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: 587, // Cố định cổng 587 theo yêu cầu
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // SMTP Login ID
        pass: process.env.SMTP_PASS, // SMTP Key
    },
};

console.log('--- SMTP CONFIGURATION ---');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('User:', config.auth.user);
console.log('--------------------------');

const transporter = nodemailer.createTransport(config);

module.exports = transporter;