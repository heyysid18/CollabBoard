const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');

// Get activities for a specific board
router.get('/:boardId', protect, async (req, res) => {
    try {
        const activities = await Activity.find({ board: req.params.boardId })
            .populate('user', 'username email') // Populate user details
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Pagination limit
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
