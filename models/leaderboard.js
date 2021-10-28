const { Schema, model } = require('mongoose');

const leaderboardSchema = new Schema({
    date: {
        required: true,
        type: Schema.Types.Date,
    },
    playerData: [
        {
            user: {
                ref: 'User',
                type: Schema.Types.ObjectId,
            },
            score: {
                type: Number,
            },
        },
    ],
});

module.exports = new model('Leaderboard', leaderboardSchema);
