const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust if paths are different
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendx');
        console.log('MongoDB connected');

        const adminExists = await User.findOne({ email: 'admin@attendx.com' });
        if (adminExists) {
            console.log('Admin already exists! Login with admin@attendx.com');
            process.exit(0);
        }

        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@attendx.com',
            password: 'admin123', // Password will be automatically hashed by pre-save hook in User model
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully: admin@attendx.com / admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
