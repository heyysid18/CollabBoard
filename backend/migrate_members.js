const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Board = require('./models/Board');
const BoardMember = require('./models/BoardMember');

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const boards = await Board.find({});
        console.log(`Found ${boards.length} boards to migrate`);

        for (const board of boards) {
            // 1. Add Owner as BoardMember (Role: owner)
            const ownerExists = await BoardMember.findOne({ board: board._id, user: board.user });
            if (!ownerExists) {
                await BoardMember.create({
                    board: board._id,
                    user: board.user,
                    role: 'owner'
                });
                console.log(`Added owner for board: ${board.title}`);
            }

            // 2. Add other members (Role: member)
            if (board.members && board.members.length > 0) {
                for (const memberId of board.members) {
                    // Skip if member is owner (already handled)
                    if (memberId.toString() === board.user.toString()) continue;

                    const memberExists = await BoardMember.findOne({ board: board._id, user: memberId });
                    if (!memberExists) {
                        await BoardMember.create({
                            board: board._id,
                            user: memberId,
                            role: 'member',
                            invitedBy: board.user // Assume owner invited them for migration
                        });
                        console.log(`Added member ${memberId} to board: ${board.title}`);
                    }
                }
            }
        }

        console.log('Migration completed successfully');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
