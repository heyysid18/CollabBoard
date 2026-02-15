const express = require('express');
const Task = require('../models/Task');
const List = require('../models/List');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get Tasks with Search & Pagination
router.get('/', protect, async (req, res) => {
    const { boardId, search, page = 1, limit = 10 } = req.query;
    const query = { board: boardId };

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    try {
        const tasks = await Task.find(query)
            .populate('assignees', 'username email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Task.countDocuments(query);

        res.json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTasks: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

        // Log Activity
        await Activity.create({
            board: boardId,
            user: req.user.id,
            action: 'created_task',
            details: `Created task "${task.title}"`,
            targetId: task._id,
            targetModel: 'Task'
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Task (Move or Edit)
router.put('/:id', protect, async (req, res) => {
    try {
        // Check if move or update
        const oldTask = await Task.findById(req.params.id);

        // Handle List Move: Update references in List models
        if (req.body.listId && oldTask.list.toString() !== req.body.listId) {
            await List.findByIdAndUpdate(oldTask.list, { $pull: { tasks: oldTask._id } });
            await List.findByIdAndUpdate(req.body.listId, { $addToSet: { tasks: oldTask._id } });

            // IMPORTANT: Update the 'list' field in the Task document to match new location
            req.body.list = req.body.listId;
        }

        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Log Activity
        let action = 'updated_task';
        let details = `Updated task "${task.title}"`;

        if (req.body.listId && oldTask.list.toString() !== req.body.listId) {
            action = 'moved_task';
            details = `Moved task "${task.title}"`;
        } else if (req.body.priority && oldTask.priority !== req.body.priority) {
            details = `Changed priority of "${task.title}" to ${req.body.priority}`;
        }

        await Activity.create({
            board: task.board,
            user: req.user.id,
            action,
            details,
            targetId: task._id,
            targetModel: 'Task'
        });

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

        // Log Activity (before delete to keep context if needed, or just log generally)
        await Activity.create({
            board: task.board,
            user: req.user.id,
            action: 'deleted_task',
            details: `Deleted task "${task.title}"`,
            targetId: task._id,
            targetModel: 'Task'
        });

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Assign Users to Task
router.patch('/:id/assign', protect, async (req, res) => {
    try {
        const { assignees } = req.body; // Array of user IDs
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const BoardMember = require('../models/BoardMember');

        // Validate assignees are members
        if (assignees && assignees.length > 0) {
            const validMembers = await BoardMember.find({
                board: task.board,
                user: { $in: assignees }
            });

            // We compare the count of unique found members to the unique requested assignees
            const uniqueAssignees = [...new Set(assignees)];
            if (validMembers.length !== uniqueAssignees.length) {
                return res.status(400).json({ message: 'One or more assignees are not members of this board' });
            }
        }

        task.assignees = assignees;
        await task.save();

        const updatedTask = await Task.findById(task._id).populate('assignees', 'username email');

        // Log Activity
        await Activity.create({
            board: task.board,
            user: req.user.id,
            action: 'task_assigned', // Ensure this enum is handled in frontend if needed
            details: `Updated assignees for task "${task.title}"`,
            targetId: task._id,
            targetModel: 'Task'
        });

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
