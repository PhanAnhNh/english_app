const transporter = require('../config/emailConfig');

const sendOtpEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Mã xác thực quên mật khẩu - English App',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản English App của mình.</p>
                    <p>Đây là mã OTP của bạn:</p>
                    <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
                    <p>Mã này sẽ hết hạn sau 10 phút.</p>
                    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">English App Team</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Không thể gửi email OTP');
    }
};

module.exports = {
    sendOtpEmail
};
