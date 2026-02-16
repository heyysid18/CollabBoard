const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    position: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
taskSchema.index({ title: 'text', description: 'text' });

// Compound index for filtering
taskSchema.index({ board: 1, list: 1 });
taskSchema.index({ board: 1, assignee: 1 });

module.exports = mongoose.model('Task', taskSchema);
