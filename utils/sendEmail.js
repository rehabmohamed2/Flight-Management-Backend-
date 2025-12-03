const SibApiV3Sdk = require('@getbrevo/brevo');

/**
 * Send email using Brevo (Sendinblue) API to bypass Railway SMTP blocks
 */
const sendEmail = async (options) => {
  try {
    // 1. Configure the Brevo Client
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.SMTP_PASS
    );

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // 2. Generate HTML version (Your existing template)
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

    // 3. Configure Email Data
    // IMPORTANT: The 'email' here MUST match the one you verified in Brevo dashboard
    sendSmtpEmail.sender = { 
        name: process.env.FROM_NAME || 'Flight Management System', 
        email: process.env.FROM_EMAIL // e.g., 'yourname@gmail.com'
    };
    
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = htmlMessage;
    sendSmtpEmail.textContent = options.message;

    // 4. Handle Attachments (Brevo requires Base64 content)
    if (options.attachments && options.attachments.length > 0) {
      sendSmtpEmail.attachment = options.attachments.map(att => ({
        name: att.filename,
        // Convert buffer to base64 string which Brevo requires
        content: (att.content instanceof Buffer) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64')
      }));
    }

    // 5. Send via HTTP API
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('Email sent successfully via Brevo. Message ID:', data.messageId);
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    // Brevo errors are often nested in error.response.body
    if (error.response && error.response.body) {
        console.error('Brevo specific error:', error.response.body);
    }
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;