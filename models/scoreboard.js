const { Schema, model } = require('mongoose');

const scoreboardSchema = new Schema({
    inning: { type: Number, default: 0 }, // 0 || 1 || 2
    tossWon: { type: Number, default: 0 }, // 0 || 1 || 2
    toss: {
        team1: String, // 'bat' || 'bowl'
        team2: String,
    },
    teams: {
        team1: [
            {
                playerId: Schema.Types.ObjectId,
                name: String,
                imageUrl: String,
                role: String,
                battingArm: String, // 'right' || 'left'
                bowlingArm: String,
            },
        ],
        team2: [
            {
                playerId: Schema.Types.ObjectId,
                name: String,
                imageUrl: String,
                role: String,
                battingArm: String,
                bowlingArm: String,
            },
        ],
    },
    scores: {
        inn1: {
            battingTeam: Number, // 0 || 1 || 2
            bowlingTeam: Number,
            bat: [
                {
                    name: String,
                    status: String,
                    score: Number,
                    bowlsFaced: Number,
                },
            ],
            bowl: [
                {
                    name: String,
                    status: String,
                    score: Number,
                    bowlsFaced: Number,
                },
            ],
            totalScore: Number,
            wickets: Number,
            overs: {
                type: Number,
                default: 0,
            },
            bowls: {
                type: Number,
                default: 0,
            },
        },
        inn2: {
            battingTeam: Number, // 0 || 1 || 2
            bowlingTeam: Number, // 0 || 1 || 2
            bat: [
                {
                    name: String,
                    status: String,
                    score: Number,
                    bowlsFaced: Number,
                },
            ],
            bowl: [
                {
                    name: String,
                    overs: Number,
                    bowls: Number,
                    wickets: Number,
                },
            ],
            totalScore: Number,
            wickets: Number,
            overs: {
                type: Number,
                default: 0,
            },
            bowls: {
                type: Number,
                default: 0,
            },
        },
    },
    batsman: {
        striker: {
            name: String,
            score: Number,
            bowlsFaced: Number,
        },
        nonStriker: {
            name: String,
            score: Number,
            bowlsFaced: Number,
        },
    },
    bowler: {
        name: String,
        overs: Number,
        bowls: Number,
        wickets: Number,
    },
});

module.exports = model('Scoreboard', scoreboardSchema);
