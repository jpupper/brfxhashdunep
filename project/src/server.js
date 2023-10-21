import express from 'express';
import socketIO from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app, cors: {
    origin: "http://localhost:3301",  // Asegúrate de cambiar esto a la URL de tu cliente
    methods: ["GET", "POST"]
  });



const io = new socketIO.Server(server);
 cors: {
    origin: "http://localhost:3301",  // Asegúrate de cambiar esto a la URL de tu cliente
    methods: ["GET", "POST"]
  }
app.use(express.static('public'));
console.log("CORRE EL SERVER");
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