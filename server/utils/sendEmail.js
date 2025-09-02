import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use your SMTP provider
      auth: {
        user: process.env.SMTP_USER,  // your email
        pass: process.env.SMTP_PASS,  // app password (not normal password!)
      },
    });

    await transporter.sendMail({
      from: `"Hall Booking System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export default sendEmail;
