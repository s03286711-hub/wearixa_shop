const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.OAUTH_CLIENT_ID,
            process.env.OAUTH_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        let refreshToken = process.env.OAUTH_REFRESH_TOKEN;
        if (refreshToken && !refreshToken.startsWith('1//')) {
            refreshToken = '1//' + refreshToken;
        }

        oAuth2Client.setCredentials({ refresh_token: refreshToken });

        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully via OAuth2');
        return result;
    } catch (error) {
        console.error('GMAIL API ERROR:', error);
        throw error;
    }
};

module.exports = sendEmail;
