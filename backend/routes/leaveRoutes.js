const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Class = require('../models/Class');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Protect all routes
router.use(authMiddleware);

// --- STUDENT ROUTES ---
// Submit a leave request
router.post('/', rbacMiddleware(['student']), async (req, res) => {
    try {
        const newLeave = new LeaveRequest({
            studentId: req.user.userId,
            classId: req.body.classId,
            date: req.body.date,
            reason: req.body.reason
        });
        const savedLeave = await newLeave.save();
        res.status(201).json(savedLeave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get leaves for student
router.get('/student', rbacMiddleware(['student']), async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ studentId: req.user.userId })
            .populate('classId', 'name code')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TEACHER / ADMIN ROUTES ---
// Get pending leave requests for teacher's classes
router.get('/teacher/pending', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.userId });
        const classIds = classes.map(c => c._id);

        const pendingLeaves = await LeaveRequest.find({
            classId: { $in: classIds },
            status: 'Pending'
        }).populate('studentId', 'name email').populate('classId', 'name code').sort({ createdAt: -1 });

        res.json(pendingLeaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve or reject leave
router.put('/:id/status', rbacMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await LeaveRequest.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        leave.status = status;
        await leave.save();
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
