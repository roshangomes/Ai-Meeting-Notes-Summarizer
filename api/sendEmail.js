// api/sendEmail.js
const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { recipientEmail, subject, content } = req.body;
  if (!recipientEmail || !subject || !content) {
    return res
      .status(400)
      .json({ error: "Missing recipientEmail, subject, or content" });
  }

  // Configure transporter (using Gmail as an example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // e.g., roshangomes42@gmail.com
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: subject,
    text: content, // Plain text summary
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
