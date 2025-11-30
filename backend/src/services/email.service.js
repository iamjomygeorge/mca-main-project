const nodemailer = require("nodemailer");
const logger = require("../config/logger");

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

    logger.info({ messageId: info.messageId }, "Email sent successfully");
    return info;
  } catch (error) {
    logger.error(error, "Error sending email");
    throw new Error("Failed to send email.");
  }
};

const send2faEmail = async (userEmail, fullName, otpCode) => {
  const firstName = fullName ? fullName.split(" ")[0] : "User";

  const subject = `Your Code - ${otpCode}`;
  const text = `Dear ${firstName},

Your code is: ${otpCode}. Use it to access your account.

If you didn't request this, simply ignore this message.

Yours,
The Inkling Team`;
  const html = `
    <div style="font-family: sans-serif; font-size: 15px; padding: 0 20px 20px 20px; color: #333;">
      <p style="margin-top: 0;">Dear ${firstName},</p>
      
      <p>Your code is: <span style="font-size: 15px; color: #333;">${otpCode}</span>. Use it to access your account.<p>
      
      <p style="font-size: 15px; color: #333;">
        If you didn't request this, simply ignore this message.
      </p>
      
      <p>Yours,<br>The Inkling Team</p>
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
