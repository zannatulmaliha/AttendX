const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    schedule: { type: String, required: true },
    students: { type: Number, default: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
