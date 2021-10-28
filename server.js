
const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`App started on PORT:${PORT}`);
});

const { Server } = require('socket.io');
const io = new Server(server);

app.use((req, res, next) => {
    io.on('connection', (socket) => {
        console.log('connected...');
        socket.on('join-room', (data) => {
            socket.join(data.matchId);
            console.log(data);
        });
        req.socket = socket;
    });
    next();
});
