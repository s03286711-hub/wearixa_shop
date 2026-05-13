const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Verify connection configuration
    try {
        await transporter.verify();
        console.log('SMTP Transport Verified');
    } catch (err) {
        console.error('SMTP Transport Error:', err);
        throw err;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (err) {
        console.error('SendMail Error:', err);
        throw err;
    }
};

module.exports = sendEmail;
