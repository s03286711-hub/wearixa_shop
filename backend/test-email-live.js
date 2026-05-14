const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const testEmail = async () => {
    console.log('--- STARTING EMAIL TEST ---');
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'MISSING'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('SUCCESS: SMTP Connection is valid!');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Wearixa Test Email',
            text: 'If you see this, your email configuration is working!',
        };

        console.log('Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('SUCCESS: Email sent!', info.response);
    } catch (error) {
        console.error('FAILURE: Error occurred:');
        console.error(error);
    }
    process.exit();
};

testEmail();
