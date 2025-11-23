const { Resend } = require('resend');

/**
 * Send email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.html - HTML message (optional)
 * @param {Array} options.attachments - Array of attachments (optional)
 */
const sendEmail = async (options) => {
  try {
    const resend = new Resend(process.env.SMPT_PASS);

    // Generate HTML version if not provided
    const htmlMessage = options.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Flight Management System</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${options.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is an automated message from Flight Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Prepare email data
    const emailData = {
      from: `${process.env.FROM_NAME || 'Flight Management System'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: htmlMessage
    };

    // Add attachments if provided (convert to Resend format)
    if (options.attachments && options.attachments.length > 0) {
      emailData.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content instanceof Buffer ? att.content : Buffer.from(att.content)
      }));
    }

    // Send email
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
