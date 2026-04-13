const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Protect all admin routes
router.use(authMiddleware);
router.use(rbacMiddleware(['admin']));

// Get global stats
router.get('/stats', async (req, res) => {
    try {
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalClasses = await Class.countDocuments();
        
        res.json({
            totalTeachers,
            totalStudents,
            totalClasses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ role: 1, createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all classes
router.get('/classes', async (req, res) => {
    try {
        const classes = await Class.find().populate('teacher', 'name email').sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
