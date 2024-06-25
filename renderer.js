// renderer.js
const socket = io('http://localhost:3000');

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.text())
    .then(data => alert(data));
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
    .then(user => {
        document.getElementById('userId').value = user.id;
        loadRooms();
    });
});

function loadRooms() {
    fetch('http://localhost:3000/rooms')
        .then(response => response.json())
        .then(rooms => {
            const roomList = document.getElementById('roomList');
            roomList.innerHTML = '';
            rooms.forEach(room => {
                const roomItem = document.createElement('li');
                roomItem.textContent = room.name;
                roomItem.addEventListener('click', () => joinRoom(room.id));
                roomList.appendChild(roomItem);
            });
        });
}

function joinRoom(room_id) {
    const user_id = document.getElementById('userId').value;
    socket.emit('joinRoom', room_id);

    socket.on('messageHistory', (messages) => {
        const messageList = document.getElementById('messageList');
        messageList.innerHTML = '';
        messages.forEach(msg => {
            const messageItem = document.createElement('li');
            messageItem.textContent = `${msg.timestamp}: ${msg.message}`;
            messageList.appendChild(messageItem);
        });
    });

    document.getElementById('messageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('messageInput').value;
        socket.emit('message', { room_id, user_id, message });
        document.getElementById('messageInput').value = '';
    });

    socket.on('message', (data) => {
        const messageList = document.getElementById('messageList');
        const messageItem = document.createElement('li');
        messageItem.textContent = `${new Date().toISOString()}: ${data.message}`;
        messageList.appendChild(messageItem);
    });
}
