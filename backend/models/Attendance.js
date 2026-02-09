const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
