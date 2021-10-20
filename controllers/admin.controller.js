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
                            { email, isAdmin: true },
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
                                isAdmin: true,
                                expiresIn: new Date(
                                    new Date().getTime() + 172800000
                                ).getTime(),
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

        const token = jwt.sign(
            { email, isAdmin: true },
            process.env.TOKEN_KEY,
            {
                expiresIn: '48h',
            }
        );

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
                        return { playerId: player.playerId };
                    });
                    const team2 = playingTeam.team2.map((player) => {
                        return { playerId: player.playerId };
                    });
                    match.predictions.forEach((item) => {
                        const results1 = team1.filter(
                            ({ value: id1 }) =>
                                !item.team1.some(
                                    ({ value: id2 }) => id2 === id1
                                )
                        );
                        const results2 = team2.filter(
                            ({ value: id1 }) =>
                                !item.team2.some(
                                    ({ value: id2 }) => id2 === id1
                                )
                        );
                        console.log(results1);
                        console.log(results2);
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
            ({ matchId, runs, isIllegal, isRotated, isOut, nextBatsman }) => {
                socket.to(matchId).emit('score-update', {
                    runs,
                    isIllegal,
                    isRotated,
                    isOut,
                    nextBatsman,
                });
                Match.findById(matchId).then((result) => {
                    const { scoreBoard, overs } = result;
                    const inning = scoreBoard.inning;
                    let totRuns =
                        scoreBoard.scores['team' + inning].totalScore + runs;
                    if (isOut) {
                        scoreBoard.batsman.striker = nextBatsman;
                    }
                    if (isRotated) {
                        const temp = scoreBoard.batsman.striker;
                        scoreBoard.batsman.striker =
                            scoreBoard.batsman.nonStriker;
                        scoreBoard.batsman.nonStriker = temp;
                    }
                    if (isIllegal) {
                        totRuns += 1;
                    } else {
                        if (scoreBoard.scores['team' + inning].bowls == 5) {
                            scoreBoard.scores['team' + inning].bowls = 0;
                            scoreBoard.scores['team' + inning].overs += 1;
                        } else {
                            scoreBoard.scores['team' + inning].bowls += 1;
                        }

                        if (scoreBoard.scores['team' + inning].overs == overs) {
                            if (scoreBoard.inning == 1) {
                                // reset score board to initial and inning = 2
                                scoreBoard.inning = 2;
                                // break the flow with return
                            } else {
                                // done and select wimPredictors
                                if (
                                    scoreBoard.inning['team1'].totalScore >
                                    scoreBoard.inning['team2'].totalScore
                                ) {
                                    result.winner = 1;
                                } else {
                                    result.winner = 2;
                                }
                            }
                            return;
                        } else if (scoreBoard.bowls == 0) {
                            const temp = scoreBoard.batsman.striker;
                            scoreBoard.batsman.striker =
                                scoreBoard.batsman.nonStriker;
                            scoreBoard.batsman.nonStriker = temp;
                        }
                    }
                    scoreBoard.scores['team' + scoreBoard.inning] = totRuns;
                    result.scoreBoard = scoreBoard;
                    return result.save().then(() => {
                        console.log('Match updated');
                    });
                });
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
