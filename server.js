const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`App started on PORT:${PORT}`);
});

const { Server } = require('socket.io');
const io = new Server(server);

app.use((req, res, next) => {
    io.on('connection', (socket) => {
        socket.on('join-room', ({ matchId }) => {
            socket.join(matchId);
        });
        req.socket = socket;
        next();
    });
});
