const jwt = require('jsonwebtoken');

exports.verifyUser = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({
            success: false,
            message: 'A token is required for authentication',
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if (decoded.isAdmin)
            return res.status(400).send({
                suceess: false,
                message: 'Need user account',
            });
    } catch (err) {
        return res
            .status(401)
            .send({ success: false, message: 'Invalid Token' });
    }
    return next();
};

exports.verifyAdmin = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({
            success: false,
            message: 'A token is required for authentication',
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if (!decoded.isAdmin)
            return res.status(400).send({
                suceess: false,
                message: 'Need admin access',
            });
    } catch (err) {
        return res
            .status(401)
            .send({ success: false, message: 'Invalid Token' });
    }
    return next();
};
