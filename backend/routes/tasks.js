const express = require('express');
const Task = require('../models/Task');
const List = require('../models/List');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create Task
router.post('/', protect, async (req, res) => {
    const { title, description, listId, boardId, priority } = req.body;
    try {
        const task = await Task.create({
            title,
            description,
            list: listId,
            board: boardId,
            priority
        });

        // Add task to list
        await List.findByIdAndUpdate(listId, { $push: { tasks: task._id } });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Task (Move or Edit)
router.put('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Task
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await List.findByIdAndUpdate(task.list, { $pull: { tasks: task._id } });
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
