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
    // Force IPv4 is helps avoid timeouts on some cloud providers
    tls: {
        ciphers: 'SSLv3'
    },
    family: 4 // Force IPv4
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
