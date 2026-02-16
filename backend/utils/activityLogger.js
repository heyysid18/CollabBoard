const Activity = require('../models/Activity');

/**
 * Logs an activity to the database and emits a real-time event.
 * @param {Object} req - Express request object (to access io)
 * @param {Object} params - Activity parameters
 * @param {string} params.boardId - ID of the board
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.actionType - Type of action (enum)
 * @param {string} params.details - Human-readable details
 * @param {string} [params.targetId] - ID of target object (Task/List/Board)
 * @param {string} [params.targetModel] - Model name of target
 * @param {Object} [params.metadata] - Additional structured data
 */
const logActivity = async (req, { boardId, userId, actionType, details, targetId, targetModel, metadata }) => {
    try {
        const activity = await Activity.create({
            board: boardId,
            user: userId,
            actionType, // Ensure this matches Schema enum
            details,
            targetId,
            targetModel,
            metadata
        });

        const populatedActivity = await Activity.findById(activity._id)
            .populate('user', 'username email');

        // Real-time emission
        const io = req.app.get('io');
        if (io) {
            io.to(boardId.toString()).emit('activity_created', populatedActivity);
        }

        return activity;
    } catch (error) {
        console.error('Activity Logging Error:', error);
        // We do typically NOT want to throw here to avoid failing the main operation
        // just because logging failed, unless strict audit is required.
        return null;
    }
};

module.exports = logActivity;
