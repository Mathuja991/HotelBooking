import nodemailer from "nodemailer";

// ⚠️ Make sure these environment variables are set in Vercel:
// EMAIL_USER = your Gmail address
// EMAIL_PASS = your 16-character Gmail App Password

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    console.log("📨 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"Kanapathi Hall" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error };
  }
};
