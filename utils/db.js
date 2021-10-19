const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');

exports.connectMock = (args) => {
    let admins = args.admins;
    let users = args.users;
    return new Promise((resolve, reject) => {
        MongoMemoryServer.create()
            .then((mongoServer) => {
                mongoose.connect(mongoServer.getUri()).then((client) => {
                    if (admins) {
                        const Admin = client.model('Admin');
                        admins.forEach((admin) => {
                            bcrypt.hash(admin.password, 10, (err, hash) => {
                                admin.password = hash;
                            });
                        });
                        Admin.insertMany(admins).then(() => {
                            resolve();
                        });
                    } else if (users) {
                        const User = client.model('User');
                        users.forEach((user) => {
                            bcrypt.hash(user.password, 10, (err, hash) => {
                                user.password = hash;
                            });
                        });
                        User.insertMany(users).then(() => {
                            resolve();
                        });
                    }
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
