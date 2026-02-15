const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        required: true,
        enum: ['created_task', 'moved_task', 'updated_task', 'deleted_task', 'completed_task', 'joined_board', 'task_assigned', 'created_board']
    },
    details: { type: String }, // Optional details e.g., "Moved from To Do to Done"
    targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the task or list involved
    targetModel: { type: String, enum: ['Task', 'List', 'Board'] }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
