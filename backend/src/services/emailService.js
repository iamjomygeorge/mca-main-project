const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

const send2faEmail = async (userEmail, otpCode) => {
  const subject = "Two-Factor Authentication";
  const text = `Your Two-Factor Authentication code is: ${otpCode}\n\nThis code will expire in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #000;">Inkling Two-Factor Authentication</h2>
      <p>Your Two-Factor Authentication code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #000;">
        ${otpCode}
      </p>
      <p>This code will expire in 10 minutes.</p>
      <p style="font-size: 12px; color: #777;">If you did not request this, please change your accoun password immediately.</p>
    </div>
  `;

  await sendEmail({
    to: userEmail,
    subject: subject,
    text: text,
    html: html,
  });
};

module.exports = {
  sendEmail,
  send2faEmail,
};