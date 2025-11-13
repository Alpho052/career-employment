const nodemailer = require('nodemailer');

let transporter;

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
      connectionTimeout: 10000, 
      socketTimeout: 10000, 
    });
    console.log('✅ Email service configured for explicit SSL on port 465.');
  } catch (error) {
    console.error('⚠️ Email service configuration failed:', error);
    transporter = null;
  }
} else {
  console.warn('📧 Email service is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  transporter = null;
}

const sendVerificationEmail = async (email, verificationCode) => {
  if (!transporter) {
    throw new Error('Email service is not working. Please contact support.');
  }

  const mailOptions = {
    from: `"Career Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code for Career Platform Lesotho',
    html: `...` // HTML content is unchanged
  };

  try {
    // Log the success response from Nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to: ${email}.`);
    console.log(`📬 Nodemailer response Message ID: ${info.messageId}`);
    console.log(`📬 Nodemailer accepted addresses: ${info.accepted}`);

  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}.`, error);
    // Re-throw the original error to be caught by the authController
    throw error; 
  }
};

module.exports = { 
  sendVerificationEmail 
};