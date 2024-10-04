const socket = io(); //io()는 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

function handleNickNameSubmit(e) {
    e.preventDefault();
    const input = room.querySelector('#name input');
    const value = input.value;
    socket.emit('nickname', input.value);
    // input.value = '';
}

function handleMessageSubmit(e) {
    e.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit('new_message', input.value, roomName, () => {
        addMessage(`You:${value}`);
    });
    input.value = '';
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `room ${roomName}`;
    const msgForm = room.querySelector('#msg');
    const nameForm = room.querySelector('#name');

    msgForm.addEventListener('submit', handleMessageSubmit);
    nameForm.addEventListener('submit', handleNickNameSubmit);
}

function handleRoomSubmit(e) {
    e.preventDefault();
    const input = form.querySelector('input');
    socket.emit('enter_room', input.value, showRoom);
    roomName = input.value;
    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (newUser, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `room ${roomName} (${newCount})`;
    addMessage(`${newUser} joined!!`);
});

socket.on('bye', (leftUser, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `room ${roomName} (${newCount})`;
    addMessage(`${leftUser} left ㅜㅜ`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.appendChild(li);
    });
});
