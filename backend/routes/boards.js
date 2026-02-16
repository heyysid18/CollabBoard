const express = require('express');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all boards (Owned & Shared)
router.get('/', protect, async (req, res) => {
    try {
        const BoardMember = require('../models/BoardMember');

        // Find boards where user is a member
        const memberships = await BoardMember.find({ user: req.user.id }).populate('board');

        const ownedBoards = [];
        const sharedBoards = [];

        memberships.forEach(m => {
            if (!m.board) return; // Skip if board deleted
            if (m.role === 'owner') {
                ownedBoards.push(m.board);
            } else {
                sharedBoards.push(m.board);
            }
        });

        res.json({ ownedBoards, sharedBoards });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create board
router.post('/', protect, async (req, res) => {
    const { title } = req.body;
    try {
        const BoardMember = require('../models/BoardMember');
        const board = await Board.create({
            title,
            user: req.user.id,
            members: [req.user.id], // Keep for now, but BoardMember is source of truth
        });

        // Create Owner entry
        await BoardMember.create({
            board: board._id,
            user: req.user.id,
            role: 'owner'
        });

        // Log Activity
        await logActivity(req, {
            boardId: board._id,
            userId: req.user.id,
            actionType: 'BOARD_CREATED',
            details: `Created board "${board.title}"`,
            targetId: board._id,
            targetModel: 'Board'
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Invite User to Board
router.post('/:id/invite', protect, async (req, res) => {
    try {
        const { email } = req.body;
        const BoardMember = require('../models/BoardMember');
        const User = require('../models/User');

        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: 'Board not found' });

        // Check if requester is owner
        if (board.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only owner can invite members' });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ message: 'User not found' });

        // Check if already member
        const existingMember = await BoardMember.findOne({ board: board._id, user: userToInvite._id });
        if (existingMember) return res.status(400).json({ message: 'User is already a member' });

        // Create Member
        await BoardMember.create({
            board: board._id,
            user: userToInvite._id,
            role: 'member',
            invitedBy: req.user.id
        });

        // Update Board members array for backward compatibility
        board.members.push(userToInvite._id);
        await board.save();

        // Populate and return new member details
        const io = req.app.get('io');

        // Notify the invited user (if they are online and in their own room - optional, or just broadcast)
        // Ideally, users join a room named by their userId upon login.
        // For now, we can emit a general event or "board_updated" to the board room.

        // Notify board members that a new member joined
        io.to(board._id.toString()).emit('board_updated');
        io.to(board._id.toString()).emit('board_member_added', userToInvite);

        // Notify the specific user if possible. 
        // We need a way to target the user. 
        // Since we don't have user-specific rooms set up in index.js yet, we can't easily target just them without changes.
        // BUT, if we modify index.js to have users join `user-${userId}`, we can do it.
        // For now, let's just make sure the board updates for current members.
        // AND, if the user is on the dashboard, they might want to know. 
        // We will implement `socket.join("user_" + userId)` in frontend Dashboard.

        // Log Activity
        await logActivity(req, {
            boardId: board._id,
            userId: req.user.id,
            actionType: 'MEMBER_INVITED',
            details: `Invited ${userToInvite.username} to the board`,
            targetId: userToInvite._id,
            targetModel: 'User',
            metadata: { invitedEmail: userToInvite.email }
        });

        res.json({ message: 'User invited successfully', user: { _id: userToInvite._id, username: userToInvite.username, email: userToInvite.email } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single board with lists and tasks
router.get('/:id', protect, async (req, res) => {
    try {
        const BoardMember = require('../models/BoardMember');

        // Access Check
        const membership = await BoardMember.findOne({ board: req.params.id, user: req.user.id });
        if (!membership) {
            return res.status(403).json({ message: 'Not authorized to view this board' });
        }

        console.log(`Fetching board ${req.params.id}`);
        const board = await Board.findById(req.params.id)
            .populate({
                path: 'lists',
                populate: {
                    path: 'tasks',
                    model: 'Task',
                    populate: {
                        path: 'assignee',
                        select: 'username email'
                    }
                }
            })
            .populate('members', 'username email');

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Board (Cascade)
router.delete('/:id', protect, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: 'Board not found' });

        // Check ownership
        if (board.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the board owner can delete it' });
        }

        const List = require('../models/List');
        const Task = require('../models/Task');
        const BoardMember = require('../models/BoardMember');
        const Activity = require('../models/Activity');

        // Cascade Delete
        await List.deleteMany({ board: board._id });
        await Task.deleteMany({ board: board._id });
        await BoardMember.deleteMany({ board: board._id });
        await Activity.deleteMany({ board: board._id });

        await board.deleteOne();

        res.json({ message: 'Board and all related data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
