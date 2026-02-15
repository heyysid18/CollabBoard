const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity in this assessment
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('CollabBoard API is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/tasks', require('./routes/tasks'));


// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_board', (boardId) => {
        socket.join(boardId);
        console.log(`User ${socket.id} joined board: ${boardId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabboard';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err));
