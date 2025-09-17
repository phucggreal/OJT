import transporter from "../config/nodemailer.js";

/**
 * Hàm gửi email dùng chung
 * @param {string} to - địa chỉ email nhận
 * @param {string} subject - tiêu đề email
 * @param {string} html - nội dung html
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"PhucGG" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error("SendMail Error:", err);
    return false;
  }
};

export default sendEmail;
