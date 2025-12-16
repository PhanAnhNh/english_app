require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- DEBUG INFO ---');
console.log('Email User:', process.env.EMAIL_USER || process.env.BREVO_USER);
const pass = process.env.EMAIL_PASS || process.env.BREVO_PASS;
console.log('Email Pass Length:', pass ? pass.length : 'undefined');
console.log('Email Pass (first 3 chars):', pass ? pass.substring(0, 3) : 'N/A');
console.log('------------------');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER || process.env.EMAIL_USER,
        pass: pass
    },
    logger: true,
    debug: true
});

(async () => {
    try {
        await transporter.verify();
        console.log('✅ KẾT NỐI SMTP THÀNH CÔNG!');
    } catch (error) {
        console.error('❌ KẾT NỐI THẤT BẠI:', error.message);
    }
})();
