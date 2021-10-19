const { Schema, model } = require('mongoose');

const MatchSchema = new Schema({
    title: String,
    predictions: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            team1: [
                {
                    playerId: Schema.Types.ObjectId,
                },
            ],
            team2: [
                {
                    playerId: Schema.Types.ObjectId,
                },
            ],
        },
    ],
    venue: String,
    date: Schema.Types.Date,
    teams: {
        team1: {
            country: String,
            flag: String,
            squad: [
                {
                    name: String,
                    imageUrl: String,
                    role: String,
                    battingArm: String,
                    bowlingArm: String,
                },
            ],
        },
        team2: {
            country: String,
            flag: String,
            squad: [
                {
                    name: String,
                    imageUrl: String,
                    role: String,
                    battingArm: String,
                    bowlingArm: String,
                },
            ],
        },
    },
    winPredictions: [
        {
            team: Number,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        },
    ],
    scoreBoard: {
        type: Schema.Types.ObjectId,
        ref: 'Scoreboard',
    },
    overs: Number,
    isLive: {
        type: Boolean,
        default: false,
    },
});

module.exports = model('Match', MatchSchema);
