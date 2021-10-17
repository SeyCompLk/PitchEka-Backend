const userControllers = require('../controllers/user.controller');
const router = require('express').Router();

router.post('/login', userControllers.postLogin);

router.post('/register', userControllers.postRegister);

router.post('/predict', userControllers.postPrediction);

router.post('/comment', userControllers.postComment);

router.post('/matches', userControllers.getMatches);

router.post('/matches/:matchId', userControllers.getMatch);

module.exports = router;
