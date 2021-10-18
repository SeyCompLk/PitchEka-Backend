const { Schema, model } = require('mongoose');

const scoreboardSchema = new Schema({
    inning: 0 || 1 || 2,
    toss: 0 || 1 || 2,
    teams: {
        team1: [
            {
                name: String,
                imageUrl: String,
                role: String,
                battingArm: 'right' || 'left',
                bowlingArm: 'right' || 'left',
            },
        ],
        team2: [
            {
                name: String,
                imageUrl: String,
                role: String,
                battingArm: 'right' || 'left',
                bowlingArm: 'right' || 'left',
            },
        ],
    },
    scores: {
        inn1: {
            battingTeam: 0 || 1 || 2,
            bowlingTeam: 0 || 1 || 2,
            bat: [],
            bowl: [],
        },
        inn2: {
            battingTeam: 0 || 1 || 2,
            bowlingTeam: 0 || 1 || 2,
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
    overs: {
        type: Number,
        default: 0,
    },
    bowls: {
        type: Number,
        default: 0,
    },
});

module.exports = model('Scoreboard', scoreboardSchema);
