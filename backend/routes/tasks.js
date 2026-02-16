const express = require('express');
const Task = require('../models/Task');
const List = require('../models/List');
const Activity = require('../models/Activity');
const logActivity = require('../utils/activityLogger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get Tasks with Search & Pagination
// Get Tasks with Search & Pagination
router.get('/', protect, async (req, res) => {
    const { boardId, search, page = 1, limit = 50, listId, assignee, priority } = req.query;

    // Base query
    const query = { board: boardId };

    // Text Search
    if (search) {
        query.$text = { $search: search };
    }

    // Filter by List
    if (listId) {
        query.list = listId;
    }

    // Filter by Assignee
    if (assignee) {
        query.assignee = assignee;
    }

    // Filter by Priority
    if (priority) {
        query.priority = priority;
    }

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = Math.min(parseInt(limit), 50); // Cap limit at 50

        // Determine sort order
        // If searching, sort by text score match quality
        // Otherwise sort by position (for Kanban) or createdAt
        let sort = { position: 1 };
        let projection = {};

        if (search) {
            sort = { score: { $meta: "textScore" } };
            projection = { score: { $meta: "textScore" } };
        } else {
            sort = { createdAt: -1 }; // Default for list view, Kanban usually fetches all
        }

        const tasks = await Task.find(query, projection)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('assignee', 'username email')
            .populate('list', 'title'); // Useful for search context

        const totalCount = await Task.countDocuments(query);

        res.json({
            tasks,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get My Assigned Tasks
router.get('/my-tasks', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ assignee: req.user.id })
            .populate('board', 'title') // Populate board title for context
            .sort({ updatedAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Task
router.post('/', protect, async (req, res) => {
    const { title, description, listId, boardId, priority, assignee } = req.body;
    try {
        const task = await Task.create({
            title,
            description,
            list: listId,
            board: boardId,
            priority,
            assignee
        });

        // Add task to list
        await List.findByIdAndUpdate(listId, { $push: { tasks: task._id } });

        // Log Activity
        await logActivity(req, {
            boardId,
            userId: req.user.id,
            actionType: 'TASK_CREATED',
            details: `Created task "${task.title}"`,
            targetId: task._id,
            targetModel: 'Task',
            metadata: { listId, priority }
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

        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignee', 'username email');

        // Log Activity
        let actionType = 'TASK_UPDATED';
        let details = `Updated task "${task.title}"`;
        let metadata = {};

        if (req.body.listId && oldTask.list.toString() !== req.body.listId) {
            actionType = 'TASK_MOVED';
            details = `Moved task "${task.title}"`;
            metadata = { fromList: oldTask.list, toList: req.body.listId };
        } else if (req.body.priority && oldTask.priority !== req.body.priority) {
            details = `Changed priority of "${task.title}" to ${req.body.priority}`;
            metadata = { oldPriority: oldTask.priority, newPriority: req.body.priority };
        }

        await logActivity(req, {
            boardId: task.board,
            userId: req.user.id,
            actionType,
            details,
            targetId: task._id,
            targetModel: 'Task',
            metadata
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
        await logActivity(req, {
            boardId: task.board,
            userId: req.user.id,
            actionType: 'TASK_DELETED',
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

// Assign User to Task
router.patch('/:id/assign', protect, async (req, res) => {
    try {
        const { assignee } = req.body; // Single user ID or null
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const BoardMember = require('../models/BoardMember');
        const User = require('../models/User'); // Import User model

        // Validate assignee is member
        if (assignee) {
            const isMember = await BoardMember.findOne({
                board: task.board,
                user: assignee
            });

            if (!isMember) {
                return res.status(400).json({ message: 'User is not a member of this board' });
            }
        }

        task.assignee = assignee;
        await task.save();

        const updatedTask = await Task.findById(task._id).populate('assignee', 'username email');

        // Fetch assignee name for log
        let assigneeName = 'Unassigned';
        if (assignee) {
            const user = await User.findById(assignee);
            assigneeName = user ? user.username : 'Unknown';
        }

        // Log Activity
        await logActivity(req, {
            boardId: task.board,
            userId: req.user.id,
            actionType: assignee ? 'TASK_ASSIGNED' : 'TASK_UNASSIGNED',
            details: assignee ? `Assigned task "${task.title}" to ${assigneeName}` : `Unassigned task "${task.title}"`,
            targetId: task._id,
            targetModel: 'Task',
            metadata: { assigneeId: assignee }
        });

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
