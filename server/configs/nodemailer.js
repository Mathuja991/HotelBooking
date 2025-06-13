import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, text }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // your Gmail address
        pass: process.env.SMTP_PASS  // your Gmail App Password
      }
    });

    // Verify transporter
    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Send email
    const info = await transporter.sendMail({
      from: '"Kanapathi Hall" <pmathuja@gmail.com>', // Proper email format
      to: to,                                        // recipient
      subject: subject,                              // email subject
      text: text                                     // email content (plain text)
    });

    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export default sendEmail;
