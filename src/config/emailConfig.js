const nodemailer = require('nodemailer');
require('dotenv').config();

const port = parseInt(process.env.EMAIL_PORT) || 465; // Default 465
const isSSL = port === 465; // 465 uses implicit SSL
const isSTARTTLS = port === 587; // 587 uses STARTTLS

const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSSL, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // TLS options
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Force TLS if using STARTTLS port
        ciphers: isSSL ? 'SSLv3' : undefined
    },
    // Force IPv4 to avoid timeouts
    family: 4,
    // Logging
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
