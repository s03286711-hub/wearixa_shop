const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const testQuery = async () => {
    try {
        const testEmail = 'wearixastore@gmail.com';
        console.log(`Searching for: ${testEmail}`);
        
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${testEmail}$`, 'i') } 
        });

        if (user) {
            console.log('SUCCESS: User found!');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('FAILURE: User not found.');
            const allUsers = await User.find({}).select('email');
            console.log('Available emails in DB:', allUsers.map(u => u.email));
        }
        process.exit();
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
};

setTimeout(testQuery, 2000);
