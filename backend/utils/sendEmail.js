const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let refreshToken = process.env.OAUTH_REFRESH_TOKEN;
    if (refreshToken && !refreshToken.startsWith('1//')) {
        refreshToken = '1//' + refreshToken;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: refreshToken,
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
