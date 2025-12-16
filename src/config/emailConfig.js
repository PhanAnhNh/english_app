const nodemailer = require('nodemailer');
require('dotenv').config();

const config = {
    service: 'gmail', // Use 'gmail' service shorthand which handles host/port automatically (usually 465 or 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Force IPv4 to avoid IPv6 timeouts
    family: 4,
    // Log for debugging
    logger: true,
    debug: true
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
