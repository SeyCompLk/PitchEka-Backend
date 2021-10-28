const userControllers = require('../controllers/user.controller');
const router = require('express').Router();
const { verifyUser } = require('../utils/verifyToken');

router.post('/login', userControllers.postLogin);

router.post('/register', userControllers.postRegister);

router.post('/predictTeam', verifyUser, userControllers.postPrediction);

router.post('/predictWinner', verifyUser, userControllers.postVote);

router.post('/comment', verifyUser, userControllers.postComment);

router.get('/matches', verifyUser, userControllers.getMatchesWithoutVoting);

router.get(
    '/matches/:matchId',
    verifyUser,
    userControllers.getMatchWithoutVoting
);

router.get('/leaders', verifyUser, userControllers.getLeaderboard);

module.exports = router;
