const nodemailer = require('nodemailer');

require('dotenv').config();

const config = {
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },


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