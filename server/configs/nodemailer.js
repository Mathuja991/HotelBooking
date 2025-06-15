import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.verify();
        console.log('Server is ready to take our messages');

        const info = await transporter.sendMail({
            from: '"Kanapathi Hall" <214mathu@gmail.com>',
            to,
            subject,
            text
        });

        console.log('Email sent: ' + info.response);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

export default sendEmail;
