const userControllers = require('../controllers/user.controller');
const router = require('express').Router();
const { verifyUser } = require('../utils/verifyToken');

router.post('/login', userControllers.postLogin);

router.post('/register', userControllers.postRegister);

router.post('/predict', verifyUser, userControllers.postPrediction);

router.post('/comment', verifyUser, userControllers.postComment);

router.post('/matches', userControllers.getMatches);

router.post('/matches/:matchId', userControllers.getMatch);

module.exports = router;
