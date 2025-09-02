import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // load .env variables

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "214mathu@gmail.com",
    pass: "jvyrtopacxehczzh",
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) console.error("SMTP verify error:", error);
  else console.log("SMTP server is ready ✅");
});

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    console.log("📨 Sending email to:", to); // debug
    const info = await transporter.sendMail({
      from: `"Kanapathi Hall" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};
