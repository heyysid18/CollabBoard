const mongoose = require('mongoose');
const List = require('./models/List');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabboard';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const lists = await List.find({});
        let cleanedCount = 0;

        for (const list of lists) {
            const originalLength = list.tasks.length;
            // Convert ObjectIds to strings for comparison, filter duplicates
            const uniqueTasks = [...new Set(list.tasks.map(t => t.toString()))];

            if (uniqueTasks.length !== originalLength) {
                list.tasks = uniqueTasks;
                await list.save();
                cleanedCount++;
                console.log(`Cleaned list "${list.title}": ${originalLength} -> ${uniqueTasks.length} tasks`);
            }
        }

        console.log(`Cleanup complete. Fixed ${cleanedCount} lists.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
