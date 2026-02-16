const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: {
        type: String,
        required: true,
        enum: [
            // Board
            'BOARD_CREATED', 'MEMBER_INVITED', 'MEMBER_REMOVED',
            // List
            'LIST_CREATED', 'LIST_RENAMED', 'LIST_DELETED',
            // Task
            'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_MOVED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED',
            // Legacy support (optional, can be removed if we migrate data)
            'created_task', 'moved_task', 'updated_task', 'deleted_task', 'completed_task', 'joined_board', 'task_assigned', 'created_board'
        ]
    },
    details: { type: String }, // Human readable string
    metadata: { type: Object }, // Flexible object for details (fromList, toList, etc.)
    targetId: { type: mongoose.Schema.Types.ObjectId, index: true }, // ID of the task or list involved
    targetModel: { type: String, enum: ['Task', 'List', 'Board', 'User'] }
}, { timestamps: true });

// Compound index for efficient querying of board history
activitySchema.index({ board: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
