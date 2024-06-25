// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
    db.run("CREATE TABLE rooms (id INTEGER PRIMARY KEY, name TEXT UNIQUE)");
    db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY, room_id INTEGER, user_id INTEGER, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

function registerUser(username, password, callback) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        callback(err);
    });
}

function authenticateUser(username, password, callback) {
    const bcrypt = require('bcryptjs');
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return callback(err);
        if (!row) return callback(new Error('User not found'));
        const isValid = bcrypt.compareSync(password, row.password);
        callback(null, isValid ? row : null);
    });
}

function getRooms(callback) {
    db.all("SELECT * FROM rooms", [], (err, rows) => {
        callback(err, rows);
    });
}

function createRoom(name, callback) {
    db.run("INSERT INTO rooms (name) VALUES (?)", [name], function(err) {
        callback(err);
    });
}

function saveMessage(room_id, user_id, message, callback) {
    db.run("INSERT INTO messages (room_id, user_id, message) VALUES (?, ?, ?)", [room_id, user_id, message], function(err) {
        callback(err);
    });
}

function getMessages(room_id, callback) {
    db.all("SELECT * FROM messages WHERE room_id = ?", [room_id], (err, rows) => {
        callback(err, rows);
    });
}

module.exports = {
    registerUser,
    authenticateUser,
    getRooms,
    createRoom,
    saveMessage,
    getMessages
};
