// Email sending utility
// NOTE: This is a placeholder. In production, use services like:
// - SendGrid, Mailgun, AWS SES, or Nodemailer with SMTP

const sendEmail = async (options) => {
  // For development: log to console
  console.log('=== EMAIL SENT ===');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);
  console.log('Message:', options.message);
  console.log('==================');

  // In production, replace with actual email service:
  /*
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
  */

  return true;
};

module.exports = sendEmail;
