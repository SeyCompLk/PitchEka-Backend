const User = require('../models/user');
const Match = require('../models/match');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.postRegister = (req, res, next) => {
    const { name, email, contactNo, password } = req.body;
    User.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(200).send({
                success: false,
                message: 'email repeated',
            });
        }
        const token = jwt.sign({ email }, process.env.TOKEN_KEY, {
            expiresIn: '48h',
        });
        bcrypt.hash(password, 10, (err, hash) => {
            const newUser = new User({
                name,
                email,
                contactNo,
                password: hash,
                token: token,
            });

            newUser.save().then(() => {
                return res.status(200).send({
                    success: true,
                    message: 'Account created successfully!',
                });
            });
        });
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email }).then((user) => {
        if (user) {
            bcrypt.compar(password, user.password, (err, result) => {
                if (!result) {
                    return res.status(400).send({
                        success: false,
                        message: 'Invalid password',
                    });
                }
                const token = jwt.sign({ email }, process.env.TOKEN_KEY, {
                    expiresIn: '48h',
                });
                user.token = token;

                user.save().then(() => {
                    return res.status(200).send({
                        success: true,
                        message: 'User logged in successfully!',
                        token,
                    });
                });
            });
        }
        return res.status(400).send({
            success: false,
            message: 'Invalid email',
        });
    });
};

exports.postPrediction = (req, res, next) => {};

exports.postComment = (req, res, next) => {};

exports.getMatches = (req, res, next) => {};

exports.getMatch = (req, res, next) => {};
