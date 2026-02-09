const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const jwt = require('jsonwebtoken');

// Protect all routes
router.use(authMiddleware);

// Get all attendance records (for testing/reports) - Teacher/Admin only
router.get('/all', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        // Find classes owned by this teacher
        const classes = await Class.find({ teacher: req.user.userId });
        const classIds = classes.map(c => c._id);

        // Find attendance for these classes
        const records = await Attendance.find({ classId: { $in: classIds } }).populate('classId');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attendance for a class - Teacher/Admin only
router.get('/:classId', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        // Verify ownership
        const classObj = await Class.findOne({ _id: req.params.classId, teacher: req.user.userId });
        if (!classObj) {
            return res.status(403).json({ message: 'Access denied. Class not found or not owned by you.' });
        }

        const records = await Attendance.find({ classId: req.params.classId });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Generate Dynamic QR Token - Teacher only
router.get('/qr-token/:classId', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        // Verify ownership
        const classObj = await Class.findOne({ _id: req.params.classId, teacher: req.user.userId });
        if (!classObj) {
            return res.status(403).json({ message: 'Access denied. Class not found or not owned by you.' });
        }

        // Generate a short-lived token (10 seconds)
        const payload = {
            classId: classObj._id,
            nonce: Math.random().toString(36).substring(7), // Random nonce to ensure uniqueness
            timestamp: Date.now()
        };

        // Use a different secret or the same one. Ideally a specific secret for QR tokens.
        // For simplicity reusing JWT_SECRET but with very short expiry.
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '10s' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark Attendance via QR Scan - Student only
router.post('/mark', rbacMiddleware(['student']), async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Verify the QR token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired QR code. Please scan again.' });
        }

        const { classId } = decoded;

        // Check if student already marked attendance for this class today
        // For simplicity, we assume one attendance per class per day? 
        // Or just check if they are already in the list for this session?
        // Since we don't have sessions, let's just record it. 
        // Ideally we should check if they already marked attendance within the last X minutes or for today.

        // Let's check if attendance exists for this student and class today.
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingRecord = await Attendance.findOne({
            classId: classId,
            studentId: req.user.userId,
            date: { $gte: startOfDay, $lte: endOfDay } // Assuming Attendance model has a date field that defaults to now
        });

        if (existingRecord) {
            return res.status(400).json({ message: 'Attendance already marked for today.' });
        }

        // Create new attendance record
        // We need student name. We can fetch it from User model or just use ID if name is not critical for now.
        // The current Attendance model expects studentName.
        // Let's fetch the user to get the name.
        const student = await require('../models/User').findById(req.user.userId);

        const newRecord = new Attendance({
            classId: classId,
            studentName: student.name,
            studentId: req.user.userId,
            status: 'Present',
            date: new Date()
        });

        await newRecord.save();

        res.status(201).json({ message: 'Attendance marked successfully', record: newRecord });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
