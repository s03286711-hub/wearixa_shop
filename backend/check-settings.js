require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const db = mongoose.connection.db;
        const settingsCollection = db.collection('settings');
        const settings = await settingsCollection.findOne({});
        console.log('Settings found:', settings);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkSettings();
