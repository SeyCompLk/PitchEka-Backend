const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const dotenv = require('dotenv');
dotenv.config();

const { Server } = require('socket.io');
const io = new Server(server);

app.use((req, res, next) => {
    req.io = io;
    next();
});

const db = require('./utils/db');
db.connect();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`App started on PORT:${PORT}`);
});
