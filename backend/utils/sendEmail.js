const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.OAUTH_REFRESH_TOKEN || !process.env.OAUTH_CLIENT_ID || !process.env.OAUTH_CLIENT_SECRET) {
            console.log('⚠️ Email credentials are not fully configured. Skipping email send.');
            return;
        }

        console.log('--- STARTING NODEMAILER OAUTH2 SEND ---');
        
        let rToken = process.env.OAUTH_REFRESH_TOKEN.trim();
        if (!rToken.startsWith('1//')) {
            rToken = `1//${rToken}`;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            connectionTimeout: 3000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER.trim(),
                clientId: process.env.OAUTH_CLIENT_ID.trim(),
                clientSecret: process.env.OAUTH_CLIENT_SECRET.trim(),
                refreshToken: rToken
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.email,
            subject: options.subject,
            text: options.message.replace(/<[^>]*>?/gm, '').trim(),
            html: options.message,
        };

        await transporter.sendMail(mailOptions);
        console.log('EMAIL SENT SUCCESSFULLY VIA NODEMAILER');
    } catch (error) {
        console.error('NODEMAILER ERROR:', error.message);
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};

module.exports = sendEmail;
