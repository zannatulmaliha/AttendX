const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.use(authMiddleware);

// Get all attendance records (for testing/reports) - Teacher/Admin only
router.get('/all', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        // Find classes owned by this teacher
        const classes = await require('../models/Class').find({ teacher: req.user.userId });
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
        const classObj = await require('../models/Class').findOne({ _id: req.params.classId, teacher: req.user.userId });
        if (!classObj) {
            return res.status(403).json({ message: 'Access denied. Class not found or not owned by you.' });
        }

        const records = await Attendance.find({ classId: req.params.classId });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Record attendance - Students and Teachers can do this
router.post('/', async (req, res) => {
    // TODO: Verify if the student ID matches the logged in user or if the user is a teacher
    const record = new Attendance({
        classId: req.body.classId,
        studentName: req.body.studentName,
        studentId: req.body.studentId,
        status: req.body.status
    });

    try {
        const savedRecord = await record.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
