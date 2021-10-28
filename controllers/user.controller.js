const User = require('../models/user');
const Match = require('../models/match');
const Leaderboard = require('../models/leaderboard');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.postRegister = (req, res, next) => {
    const { name, email, contactNo, password } = req.body;
    User.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(400).send({
                success: false,
                message: 'email repeated',
            });
        }
        const token = jwt.sign(
            { email, isAdmin: false },
            process.env.TOKEN_KEY,
            {
                expiresIn: '48h',
            }
        );
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
            bcrypt.compare(password, user.password, (err, result) => {
                if (!result) {
                    res.status(400).send({
                        success: false,
                        message: 'Invalid password',
                    });
                } else {
                    const token = jwt.sign(
                        { email, isAdmin: false },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: '48h',
                        }
                    );
                    user.token = token;

                    user.save().then(() => {
                        return res.status(200).send({
                            success: true,
                            message: 'User logged in successfully!',
                            isAdmin: false,
                            expiresIn: new Date(
                                new Date().getTime() + 172800000
                            ).getTime(),
                            token,
                        });
                    });
                }
            });
        } else {
            res.status(400).send({
                success: false,
                message: 'Invalid email',
            });
        }
    });
};

exports.postPrediction = (req, res, next) => {
    const { matchId, team1, team2 } = req.body;
    Match.findById(matchId)
        .populate('predictions.user')
        .then((result) => {
            const voted = result.predictions.find((prediction) => {
                return prediction.user.email === req.user;
            });
            if (!result.scoreBoard.inning == 0 || result.isLive) {
                return res.status(400).send({
                    success: false,
                    message: 'Match already started',
                });
            }
            if (voted) {
                return res.status(400).send({
                    success: false,
                    message: 'User already voted',
                });
            }
            User.findOne({ email: req.user }).then((user) => {
                result.predictions.push({ user: user._id, team1, team2 });
                result.save().then(() => {
                    res.status(200).send({
                        success: true,
                        message: 'Prediction updated successfully',
                    });
                });
            });
        })
        .catch(console.log);
};

exports.postVote = (req, res, next) => {
    const { matchId, team } = req.body;
    Match.findById(matchId)
        .populate('winPredictions.user')
        .then((result) => {
            const voted = result.winPredictions.find((prediction) => {
                return prediction.user.email === req.user;
            });
            if (!result.scoreBoard.inning == 1 || !result.isLive) {
                return res.status(400).send({
                    success: false,
                    message: 'Match has not started yet',
                });
            }
            if (voted) {
                return res.status(400).send({
                    success: false,
                    message: 'User already voted for a winner',
                });
            }
            User.findOne({ email: req.user }).then((user) => {
                result.winPredictions.push({ user: user._id, team });
                result.save().then(() => {
                    res.status(200).send({
                        success: true,
                        message: 'Winner prediction updated successfully',
                    });
                });
            });
        });
};

exports.postComment = (req, res, next) => {
    req.socket.on('message', ({ matchId, message }) => {
        console.log(message);
        req.socket.to(matchId).emit('message', { message });
    });
};

exports.getMatchesWithoutVoting = (req, res, next) => {
    Match.find({})
        .populate('predictions.user')
        .populate('winPredictions.user')
        .then((result) => {
            const finRes = result.map((single) => {
                const voted = single.predictions.find((prediction) => {
                    return prediction.user.email === req.user;
                });
                const winnerVoted = single.winPredictions.find((prediction) => {
                    return prediction.user.email === req.user;
                });
                return {
                    teamsVoted: !req.verified || voted ? true : false,
                    winnerVoted: !req.verified || winnerVoted ? true : false,
                    matchData: single,
                };
            });
            res.status(200).send(finRes);
        })
        .catch(console.log);
};

exports.getMatchWithoutVoting = (req, res, next) => {
    const matchId = req.params.matchId;
    Match.findById(matchId)
        .populate('predictions.user')
        .then((result) => {
            const voted = result.predictions.find((prediction) => {
                return prediction.user.email === req.user;
            });
            const winnerVoted = result.winPredictions.find((prediction) => {
                return prediction.user.email === req.user;
            });
            res.status(200).send({
                voted: !req.verified || voted ? true : false,
                winnerVoted: !req.verified || winnerVoted ? true : false,
                matchData: result,
            });
        })
        .catch(console.log);
};

exports.getLeaderboard = (req, res, next) => {
    User.find({}).then((result) => {
        const currLeaderboard = result
            .map((person) => {
                return { name: person.name, points: person.points };
            })
            .sort((a, b) => a.points - b.points);

        Leaderboard.find({})
            .populate('playerData.user')
            .then((leaders) => {
                const finLeaderboard = leaders
                    .map((p) => {
                        return {
                            date: p.date,
                            players: p.playerDaplayerData.map((i) => {
                                return { name: i.user.name, points: i.score };
                            }),
                        };
                    })
                    .sort(
                        (a, b) =>
                            new Date().getTime() -
                            b.date -
                            (new Date().getTime() - a.date)
                    );

                res.status(200).send({
                    curr: currLeaderboard,
                    past: finLeaderboard,
                });
            });
    });
};
