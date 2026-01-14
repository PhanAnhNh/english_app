require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/model/User');

const updateRole = async () => {
    try {
        // 1. Connect to Database
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 2. Find and Update User
        const targetUsername = 'admin_pro3';
        const user = await User.findOne({ username: targetUsername });

        if (!user) {
            console.log(`❌ User [${targetUsername}] not found.`);
        } else {
            console.log(`Found user: ${user.username} (Current role: ${user.role})`);
            user.role = 'super_admin';
            await user.save();
            console.log(`✅ Successfully updated [${targetUsername}] to [super_admin].`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    }
};

updateRole();
