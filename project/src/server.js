import express from 'express';
import socketIO from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('NEW CONNECTION:', socket.id);

    socket.on('mouse', (data) => {
        socket.broadcast.emit('mouse', data);
        console.log(data);
    });
});

server.listen(3000, () => {
    console.log('My socket server is running on port 3000');
});