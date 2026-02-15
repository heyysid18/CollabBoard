const express = require('express');
const List = require('../models/List');
const Board = require('../models/Board');
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

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update List
router.put('/:id', protect, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

        await Board.findByIdAndUpdate(list.board, { $pull: { lists: list._id } });
        await list.deleteOne();
        res.json({ message: 'List removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
