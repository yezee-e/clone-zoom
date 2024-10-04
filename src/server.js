import http from 'http';
import express from 'express';
// import { WebSocketServer } from 'ws';
import SocketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

////////////////////////////////websocket///////////////////////////////////////////////////

// const handleListen = () => console.log('Listening on http://localhost:3005');
// const server = http.createServer(app);
// const wss = new WebSocketServer({ server }); //http서버와 ws서버가 함께 존재
// const sockets = [];

// wss.on('connection', (socket) => {
//     sockets.push(socket);
//     socket['nickname'] = 'Anon';
//     // console.log(socket);
//     console.log('connected to Browser🥳');
//     socket.on('close', () => {
//         console.log('Disconnected from server🥵');
//     });
//     socket.on('message', (message) => {
//         const parsed = JSON.parse(message);
//         switch (parsed.type) {
//             case 'new_message':
//                 sockets.forEach((aSocket) =>
//                     aSocket.send(`${socket.nickname}:${parsed.payload}`)
//                 );
//                 break;
//             case 'nickname':
//                 socket['nickname'] = parsed.payload;
//         }

//          socket.send(message.toString('utf-8'));
//     });
// });
// server.listen(3005, handleListen);

//////////////////////////////////////////socket.io///////////////////////////////////////////
const handleListen = () => console.log('Listening on http://localhost:3005');
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
httpServer.listen(3005, handleListen);

wsServer.on('connection', (socket) => {
    socket.onAny((e) => {
        console.log(`Socket event ${e}`);
    });

    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName); //방에입장
        done(); //방에입장을 프론트에 알림
        socket.to(roomName).emit('welcome'); //본인을 제외하고 방안모두에게 입장알림
        socket.on('disconnecting', () => {
            socket.rooms.forEach((room) => {
                socket.to(room).emit('bye');
            });
        }); // 브라우저는 이미 닫았지만 아직 연결이 끊어지지 않은 그 찰나에 발생하는 이벤트
        socket.on('new_message', (msg, room, done) => {
            socket.to(room).emit('new_message', msg);
            done();
        });
    });
});

/*disconnect : 연결이 완전히 끊어졌을때 발생하는 이벤트 (room 정보가 비어있음)
disconnecting : 브라우져는 이미 닫았지만 아직 연결이 끊어지지 않은 그 찰나에
발생하는 이벤트 (그래서 room 정보가 살아있음)
*/
