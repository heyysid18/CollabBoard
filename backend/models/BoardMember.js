const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
        type: String,
        enum: ['owner', 'member', 'viewer'],
        default: 'member'
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Compound index to prevent duplicate members in the same board
boardMemberSchema.index({ board: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('BoardMember', boardMemberSchema);
