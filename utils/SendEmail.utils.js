// ==================== sendEmail.js ====================
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASS
          }
        });
    
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          text
        });
    
        console.log("Email sent: ", info.response);
      } catch (err) {
        console.error("Failed to send email:", err);
      }
};

export default sendEmail;