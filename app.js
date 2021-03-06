const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

require('dotenv').config();

const db = require('./utils/db');
if (process.env.NODE_ENV != 'test') db.connect();

const adminRoutes = require('./routes/admin.routes');
app.use('/admin', adminRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/user', userRoutes);

app.use('/', (req, res, next) => {
    res.send('Welcome to the pitch eka API');
});

module.exports = app;
