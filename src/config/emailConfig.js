const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    // Render hoặc Cloud Host thường chặn port mặc định, nên cần config thủ công
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587, // Port 587 thường ổn định hơn trên Cloud
    secure: process.env.EMAIL_PORT == 465, // true nếu dùng port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = transporter;
