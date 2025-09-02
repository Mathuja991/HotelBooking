import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail App Password
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    console.log(process.env.EMAIL_USER);
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
