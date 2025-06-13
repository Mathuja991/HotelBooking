import nodemailer from "nodemailer";

async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password from Gmail
      },
    });

    await transporter.verify();
    console.log("SMTP server is ready");

    const info = await transporter.sendMail({
      from: `"Kanapathi Hall" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: ", info.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export default sendEmail;
