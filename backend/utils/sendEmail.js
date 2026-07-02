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
            // Use explicit host + port to force IPv4 (Railway doesn't support IPv6 outbound)
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            family: 4, // Force IPv4
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
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
        // Log but do NOT throw — email failure must NEVER block or affect order placement
        console.error('NODEMAILER ERROR (non-critical):', error.message);
    }
};

module.exports = sendEmail;
