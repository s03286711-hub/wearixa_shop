const axios = require('axios');

const sendEmail = async (options) => {
    try {
        console.log('--- STARTING GMAIL API HTTP SEND ---');
        
        // 1. Get Access Token from Refresh Token
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            refresh_token: process.env.OAUTH_REFRESH_TOKEN.startsWith('1//') ? process.env.OAUTH_REFRESH_TOKEN : `1//${process.env.OAUTH_REFRESH_TOKEN}`,
            grant_type: 'refresh_token',
        });

        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token acquired');

        // 2. Construct the Email
        const str = [
            `Content-Type: text/html; charset="UTF-8"\n`,
            `MIME-Version: 1.0\n`,
            `Content-Transfer-Encoding: 7bit\n`,
            `to: ${options.email}\n`,
            `from: ${process.env.EMAIL_FROM}\n`,
            `subject: ${options.subject}\n\n`,
            options.message
        ].join('');

        const encodedMail = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // 3. Send via Gmail API
        await axios.post(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            { raw: encodedMail },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('EMAIL SENT SUCCESSFULLY VIA HTTP API');
    } catch (error) {
        console.error('GMAIL HTTP API ERROR:', error.response ? error.response.data : error.message);
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};

module.exports = sendEmail;
