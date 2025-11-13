const nodemailer = require('nodemailer');

let transporter;

// Initialize the transporter
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add connection timeouts for faster feedback
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
    });
    console.log('✅ Email service re-configured for explicit SSL on port 465.');
  } catch (error) {
    console.error('⚠️ Email service configuration failed:', error);
    transporter = null;
  }
} else {
  console.warn('📧 Email service is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  transporter = null;
}

// Send verification email
const sendVerificationEmail = async (email, verificationCode) => {
  if (!transporter) {
    console.error('❌ Cannot send email because the email service is not configured.');
    throw new Error('The email service is not working. Please contact support.');
  }

  const mailOptions = {
    from: `"Career Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code for Career Platform Lesotho',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
          <h1 style="color: #2c5aa0;">Career Platform Lesotho</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering! Please use the following code to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #555;">Your verification code is:</p>
            <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #fff; background-color: #2c5aa0; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;">
              ${verificationCode}
            </span>
          </div>
          <p>This code is valid for 24 hours. If you did not request this, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888;">
          <p>Best regards,<br><strong>The Career Platform Team</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email successfully sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    // Re-throw the ORIGINAL error to be caught by the calling controller
    throw error;
  }
};

module.exports = { 
  sendVerificationEmail 
};