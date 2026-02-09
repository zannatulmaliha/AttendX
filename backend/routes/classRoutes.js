const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Protect all routes
router.use(authMiddleware);

// Only teachers and admins can manage classes
router.use(rbacMiddleware(['teacher', 'admin']));

// Get all classes for the logged-in teacher
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.userId });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Create a new class
router.post('/', async (req, res) => {
    const newClass = new Class({
        code: req.body.code,
        name: req.body.name,
        schedule: req.body.schedule,
        students: req.body.students,
        teacher: req.user.userId // Assign the logged-in teacher
    });

    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a class
router.delete('/:id', async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json({ message: 'Class deleted successfully', deletedClass });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
