const express = require('express');
const List = require('../models/List');
const Board = require('../models/Board');
const logActivity = require('../utils/activityLogger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create List
router.post('/', protect, async (req, res) => {
    const { title, boardId } = req.body;
    try {
        const list = await List.create({
            title,
            board: boardId,
        });

        // Add list to board
        await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });

        // Log Activity
        await logActivity(req, {
            boardId,
            userId: req.user.id,
            actionType: 'LIST_CREATED',
            details: `Created list "${list.title}"`,
            targetId: list._id,
            targetModel: 'List'
        });

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update List
router.put('/:id', protect, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Log Activity
        if (req.body.title) {
            await logActivity(req, {
                boardId: list.board,
                userId: req.user.id,
                actionType: 'LIST_RENAMED',
                details: `Renamed list to "${list.title}"`,
                targetId: list._id,
                targetModel: 'List'
            });
        }

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete List
router.delete('/:id', protect, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const Task = require('../models/Task');

        // Remove list reference from board
        await Board.findByIdAndUpdate(list.board, { $pull: { lists: list._id } });

        // Delete all tasks in this list
        await Task.deleteMany({ list: list._id });

        // Log Activity
        await logActivity(req, {
            boardId: list.board,
            userId: req.user.id,
            actionType: 'LIST_DELETED',
            details: `Deleted list "${list.title}"`,
            targetId: list._id,
            targetModel: 'List'
        });

        await list.deleteOne();
        res.json({ message: 'List and associated tasks removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
