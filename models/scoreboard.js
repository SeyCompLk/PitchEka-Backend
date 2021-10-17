const { Schema, model } = require('mongoose');

const scoreboardSchema = new Schema({
    match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
    },
});
