const Admin = require('../models/admin');
const Match = require('../models/match');
const Scoreboard = require('../models/scoreboard');
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
                                token,
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
            expiresIn: '48h',
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

exports.postMatch = (req, res, next) => {
    // title
    // venue
    // date
    // squads
    // overs
    // create a score board
    // innings - 0
    // tosswon - 0
    // tossteam
    // teams - will be updated in the squad
    const { title, venue, date, squads, overs } = req.body;

    const newScoreboard = new Scoreboard();

    newScoreboard
        .save()
        .then((response) => {
            console.log(response);
            const newMatch = new Match({
                title,
                venue,
                date,
                teams: squads,
                overs,
                scoreBoard: response._id,
            });
            newMatch.save().then(() => {
                res.status(200).send({
                    success: true,
                    message: 'Match created successfully',
                });
            });
        })
        .catch(console.log);
};

exports.updateMatch = (req, res, next) => {
    req.io.on('connection', (socket) => {
        socket.on('toss', ({ teamWon, selectedTo, playingTeam, matchId }) => {
            socket.to(matchId).emit('toss-update', {
                teamWon,
                selectedTo,
                playingTeam,
                matchId,
            });
            Match.findById(matchId)
                .populate('scoreBoard predictions.user')
                .then((match) => {
                    const { scoreBoard } = match;
                    scoreBoard.inning = 1;
                    scoreBoard.tossWon = teamWon[teamWon.length - 1];
                    scoreBoard.toss = selectedTo;
                    scoreBoard.teams = playingTeam;
                    scoreBoard.scores.inn1.battingTeam =
                        selectedTo.team1 === 'bat' ? 1 : 2;
                    scoreBoard.scores.inn1.bowlingTeam =
                        selectedTo.team1 === 'bat' ? 2 : 1;
                    scoreBoard.scores.inn2.battingTeam =
                        selectedTo.team1 === 'bat' ? 2 : 1;
                    scoreBoard.scores.inn2.bowlingTeam =
                        selectedTo.team1 === 'bat' ? 1 : 2;

                    const team1 = playingTeam.team1.map((player) => {
                        return { playerId: player._id };
                    });
                    const team2 = playingTeam.team2.map((player) => {
                        return { playerId: player._id };
                    });
                    match.predictions.forEach((item) => {
                        let correctCount = 0;
                        item.team1.forEach((prediction) => {
                            if (team1.includes(prediction)) {
                                correctCount++;
                            }
                        });
                        item.team2.forEach((prediction) => {
                            if (team2.includes(prediction)) {
                                correctCount++;
                            }
                        });
                        if (correctCount == 22) {
                            item.user.points += 10;
                        } else if (correctCount >= 19 && correctCount < 22) {
                            item.user.points += 7;
                        } else if (correctCount >= 15 && correctCount < 19) {
                            item.user.points += 5;
                        }
                    });
                    match.scoreBoard = scoreBoard;
                    match.isLive = true;
                    match.save();
                })
                .catch(console.log);
        });
    });
};

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

exports.getMatches = (req, res, next) => {
    Match.find().then((result) => {
        res.status(200).send(result);
    });
};

exports.getSingleMatch = (req, res, next) => {
    const matchId = req.params.matchId;
    Match.findById(matchId).then((match) => {
        res.status(200).send(match);
    });
};
