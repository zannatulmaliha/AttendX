const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
<<<<<<< HEAD
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' }
=======
    role: { type: String, enum: ['teacher', 'admin', 'student'], default: 'student' }
>>>>>>> f46442d5f434df5fa94ac4cfe00ce7befdf87f61
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
