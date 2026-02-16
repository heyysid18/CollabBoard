const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');

// Get activities for a specific board
router.get('/:boardId', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const activities = await Activity.find({ board: req.params.boardId })
            .populate('user', 'username email') // Populate user details
            .sort({ createdAt: -1 }) // Newest first
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Activity.countDocuments({ board: req.params.boardId });

        res.json({
            activities,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalActivities: count
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
