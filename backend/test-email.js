require('dotenv').config({ path: __dirname + '/.env' });
const sendEmail = require('./utils/sendEmail');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('OAUTH_CLIENT_ID exists?', !!process.env.OAUTH_CLIENT_ID);
console.log('OAUTH_CLIENT_SECRET exists?', !!process.env.OAUTH_CLIENT_SECRET);
console.log('OAUTH_REFRESH_TOKEN exists?', !!process.env.OAUTH_REFRESH_TOKEN);

async function test() {
    try {
        await sendEmail({
            email: 'wearixastore@gmail.com', // destination
            subject: 'Test Email Diagnostic',
            message: '<h1>This is a diagnostic test</h1>'
        });
        console.log('\n✅ SUCCESS: Email sent without errors.');
    } catch (err) {
        console.error('\n❌ FAILED TO SEND EMAIL:');
        console.error(err.message);
    }
}

test();
