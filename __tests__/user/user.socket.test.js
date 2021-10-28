/*eslint-env jest */

const { Server } = require('socket.io');
const Client = require('socket.io-client');
const app = require('../../app');

describe('Real time chat option', () => {
    let io, clientSocket, serverSocket;
    beforeAll((done) => {
        const server = app.listen(8000);
        io = new Server(server);
        clientSocket = new Client('http://localhost:8000');
        io.on('connection', (socket) => {
            serverSocket = socket;
        });
        clientSocket.on('connect', () => {
            clientSocket.emit('join-room', { matchId: 1 });
            done();
        });
    });
    afterAll((done) => {
        io.close();
        clientSocket.close();
        done();
    });

    // test('Should recieve match id when emits join room event', (done) => {
    //     serverSocket.on('join-room', (data) => {
    //         expect(data.matchId).toBe(1);
    //         serverSocket.join(data.matchId);
    //         done();
    //     });
    // });

    test('Should recieve message to server', (done) => {
        serverSocket.on('join-room', (data) => {
            serverSocket.join(data.matchId);
        });
        clientSocket.emit('message', { message: 'Hello world', matchId: 1 });

        serverSocket.on('message', (data) => {
            expect(data.message).toBe('Hello world');
            done();
        });
    });

    // test('Should rediect the message by server', (done) => {
    //     serverSocket.on('join-room', (data) => {
    //         serverSocket.join(data.matchId);
    //     });
    //     clientSocket.on('message', (data) => {
    //         expect(data.message).toBe('Hello World');
    //         done();
    //     });
    //     serverSocket.to(1).emit('message', { message: 'Hello World' });
    // });
});
