require('dotenv').config();
require('express-async-errors');
const cron = require('node-cron');

const mongoose = require('mongoose');
const user = require('./src/models/user');

const app = require('./app');

if (!process.env.TOKEN_KEY) {
    console.log('Api secret token is missing!');
    return;
}
if (!process.env.MONGO_DATABASE_URL) {
    console.log('Mongo URL is missing!');
    return;
}

const createDefaultUser = async () => {
    const userCount = await user.countDocuments({});
    if (userCount === 0) {
        const admin = new user({
            email: 'superAdmin@uniza.sk',
            isAdmin: true,
            isActive: true,
            name: 'Administrator',
            surName: ''
        });
        admin.setPassword('admin');
        await admin.save();
    }
};

const start = async () => {
    cron.schedule('0 1 * * *', () => {
        console.log('Execute cron task');
    });
    try {
        await mongoose.connect(process.env.MONGO_DATABASE_URL);
        console.log('Mongoose connected');
        await createDefaultUser();

        app.listen(5000, () => {
            console.log(`Listening at http://localhost:5000`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
