const Admin = require('../models/admin');
const Match = require('../models/match');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    Admin.findOne({ email: email }).then((user) => {
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    if (!user.verified) {
                        res.status(400).send({
                            success: false,
                            message:
                                'You must have a verified admin account to continue',
                        });
                    } else {
                        const token = jwt.sign(
                            { email },
                            process.env.TOKEN_KEY,
                            {
                                expiresIn: '48h',
                            }
                        );

                        user.token = token;

                        user.save().then(() => {
                            res.status(200).send({
                                success: true,
                                message: 'User logged in successfully!',
                            });
                        });
                    }
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Invalid password',
                    });
                }
            });
        } else {
            res.status(400).send({
                success: false,
                message: 'Cannot find an account',
            });
        }
    });
};

exports.postRegister = (req, res, next) => {
    const { email, password } = req.body;
    Admin.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(400).send({
                success: false,
                message: 'A user with the same email address already exists',
            });
        }

        const token = jwt.sign({ email }, process.env.TOKEN_KEY, {
            expiresIn: '24h',
        });

        bcrypt.hash(password, 10, (err, newPassword) => {
            const newAdmin = new Admin({
                email,
                password: newPassword,
                token,
            });

            newAdmin.save().then(() => {
                res.status(200).send({
                    success: true,
                    message:
                        'Account created successfully wait for the approval!',
                });
            });
        });
    });
};

exports.postMatch = (req, res, next) => {};

exports.updateMatch = (req, res, next) => {};

exports.updateScore = (req, res, next) => {
    req.io.on('connection', (socket) => {
        socket.on('join_room', ({ roomId }) => {
            socket.join(roomId);
        });

        socket.on(
            'score-admin',
            ({ matchId, runs, isIllegal, isRotated, isOut }) => {
                socket
                    .to(matchId)
                    .emit('score-pdate', { runs, isIllegal, isRotated, isOut });
                //database work
            }
        );
    });
};

exports.getMatches = (req, res, next) => {};

exports.getSingleMatch = (req, res, next) => {};
