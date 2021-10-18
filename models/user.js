const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true,
    },
    contactNo: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
    points: {
        type: Number,
        default: 0,
    },
});

module.exports = new model('User', userSchema);
