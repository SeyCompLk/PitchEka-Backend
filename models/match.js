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
                    playerId: Number,
                },
            ],
            team2: [
                {
                    playerId: Number,
                },
            ],
        },
    ],
    venue: String,
    date: Schema.Types.Date,
    teams: {
        team1: String,
        team2: String,
    },
    scoreBoard: {
        type: Schema.Types.ObjectId,
        ref: 'Scoreboard',
    },
});

module.exports = model('Match', MatchSchema);
