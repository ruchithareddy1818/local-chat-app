// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.registerUser(username, password, (err) => {
        if (err) return res.status(500).send('Registration failed');
        res.send('Registration successful');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.authenticateUser(username, password, (err, user) => {
        if (err || !user) return res.status(401).send('Authentication failed');
        res.send({ id: user.id, username: user.username });
    });
});

app.get('/rooms', (req, res) => {
    db.getRooms((err, rooms) => {
        if (err) return res.status(500).send('Failed to fetch rooms');
        res.send(rooms);
    });
});

app.post('/rooms', (req, res) => {
    const { name } = req.body;
    db.createRoom(name, (err) => {
        if (err) return res.status(500).send('Room creation failed');
        res.send('Room created successfully');
    });
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (room_id) => {
        socket.join(room_id);
        db.getMessages(room_id, (err, messages) => {
            if (err) return;
            socket.emit('messageHistory', messages);
        });
    });

    socket.on('message', (data) => {
        const { room_id, user_id, message } = data;
        db.saveMessage(room_id, user_id, message, (err) => {
            if (err) return;
            io.to(room_id).emit('message', data);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
