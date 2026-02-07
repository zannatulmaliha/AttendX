const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Get all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find();
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
        students: req.body.students
    });

    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
