import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text }) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:process.env.SMTP_USER , // your Gmail address
        pass:process.env.SMTP_PASS    // app-specific password from Google
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: '"Kanapathi Hall" pmathuja@gmailcom', // sender
      to: to,                                          // recipient
      subject: subject,                                // email subject
      text: text                                       // email content (plain text)
    });

    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
