const sendEmail = require('../utils/sendEmail');

exports.sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Admin emails to receive contact messages
    const adminEmails = ['rehabmohamed151220@gmail.com', 'kimoshalby1105@gmail.com'];

    // Email subject
    const emailSubject = subject
      ? `Contact Form: ${subject}`
      : `Contact Form Message from ${name}`;

    // Email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Message</h1>
        </div>

        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">From:</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              <strong>Name:</strong> ${name}<br>
              <strong>Email:</strong> <a href="mailto:${email}" style="color: #f59e0b;">${email}</a>
            </p>
          </div>

          ${subject ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Subject:</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">${subject}</p>
          </div>
          ` : ''}

          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="color: #374151; margin: 0; font-size: 14px; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <a href="mailto:${email}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Reply to ${name}
            </a>
          </div>
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          This message was sent from the SkyGate contact form.
        </p>
      </div>
    `;

    await sendEmail({
      email: adminEmails.join(', '),
      subject: emailSubject,
      html: htmlContent
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });

  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
