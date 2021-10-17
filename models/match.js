const { Schema, model } = require('mongoose');

const MatchSchema = new Schema({
    team1: {
        type: String,
        required: true,
    },
    team2: {
        type: String,
        required: true,
    },
    team1Team: [
        {
            playerId: Number,
        },
    ],
    team2Team: [
        {
            playerId: Number,
        },
    ],
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
    status: {
        type: String,
        default: 'Not started',
    },
    venue: String,
    date: Schema.Types.Date,
});

module.exports = model('Match', MatchSchema);
