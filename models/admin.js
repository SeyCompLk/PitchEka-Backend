const { Schema, model } = require('mongoose');

const adminSchema = new Schema({
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
    verified: {
        type: Boolean,
        default: false,
    },
});

module.exports = new model('Admin', adminSchema);
