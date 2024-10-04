import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
// import SocketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3005');

////////////////////////////////websocket///////////////////////////////////////////////////

const server = http.createServer(app);
const wss = new WebSocketServer({ server }); //http서버와 ws서버가 함께 존재
const sockets = [];

wss.on('connection', (socket) => {
    sockets.push(socket);
    socket['nickname'] = 'Anon';
    // console.log(socket);
    console.log('connected to Browser🥳');
    socket.on('close', () => {
        console.log('Disconnected from server🥵');
    });
    socket.on('message', (message) => {
        const parsed = JSON.parse(message);
        switch (parsed.type) {
            case 'new_message':
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}:${parsed.payload}`)
                );
                break;
            case 'nickname':
                socket['nickname'] = parsed.payload;
        }

        // socket.send(message.toString('utf-8'));
    });
});
server.listen(3005, handleListen);

//////////////////////////////////////////socket.io///////////////////////////////////////////

// const wsServer=SocketIO(httpServer);
// httpServer.listen(3005, handleListen);
