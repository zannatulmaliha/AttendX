const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get all attendance records (for testing/reports)
router.get('/all', async (req, res) => {
    try {
        const records = await Attendance.find().populate('classId');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attendance for a class
router.get('/:classId', async (req, res) => {
    try {
        const records = await Attendance.find({ classId: req.params.classId });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Record attendance
router.post('/', async (req, res) => {
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
