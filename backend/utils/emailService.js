const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify().then(() => console.log('✅ Email service configured.'))
                     .catch(err => console.error('❌ Email service failed:', err));

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: `"Career Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email for Career Platform Lesotho',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #f9f9f9; border: 1px solid #ddd;">
        <h2 style="text-align: center; color: #2c5aa0;">Career Platform Lesotho</h2>
        <p>Hello,</p>
        <p>Thank you for registering! Your verification code is:</p>
        <h1 style="text-align:center; color:#fff; background:#2c5aa0; padding: 10px 20px; border-radius:5px; letter-spacing:5px;">${verificationCode}</h1>
        <p>This code is valid for 24 hours.</p>
        <p>If you didn't request this, ignore this email.</p>
        <p>Best regards,<br/><strong>Career Platform Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${email}`);
};

module.exports = { sendVerificationEmail };
