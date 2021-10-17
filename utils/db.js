const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

exports.connectMock = () => {
    return new Promise((resolve, reject) => {
        MongoMemoryServer.create()
            .then((mongoServer) => {
                mongoose.connect(mongoServer.getUri()).then((client) => {
                    resolve();
                });
            })
            .catch((err) => reject(err));
    });
};

exports.connect = () => {
    return new Promise((resolve, reject) => {
        mongoose
            .connect(process.env.MONGO_URL)
            .then(() => {
                resolve();
            })
            .catch((err) => reject(err));
    });
};

exports.close = () => {
    return mongoose.disconnect();
};
