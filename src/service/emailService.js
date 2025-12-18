const transporter = require('../config/emailConfig');

// Đặt giá trị mặc định cho Tên Người Gửi và Email Người Gửi
// Cần đảm bảo biến môi trường SENDER_NAME và EMAIL_USER được cấu hình
const SENDER_NAME = process.env.SENDER_NAME || 'English App Team';
const SENDER_EMAIL = process.env.EMAIL_USER;

const sendOtpEmail = async (to, otp) => {
    // Kiểm tra xem địa chỉ người gửi đã được cấu hình chưa
    if (!SENDER_EMAIL) {
        console.error('Lỗi cấu hình: Biến môi trường EMAIL_USER bị thiếu.');
        throw new Error('Cấu hình gửi email chưa hoàn tất.');
    }

    const mailOptions = {
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: to,
        subject: "Mã xác thực quên mật khẩu - English App",
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email via Nodemailer:', error);
        throw new Error('Không thể gửi email OTP. Vui lòng thử lại sau.');
    }
};

module.exports = {
    sendOtpEmail
};