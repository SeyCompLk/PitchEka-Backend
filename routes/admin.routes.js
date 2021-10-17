const adminControllers = require('../controllers/admin.controller');
const router = require('express').Router();

router.post('/login', adminControllers.postLogin);

router.post('/add-match', adminControllers.postMatch);

router.put('/update-match/:matchId', adminControllers.updateMatch);

router.put('/update-score/:matchId', adminControllers.updateScore);

router.get('/matches', adminControllers.getMatches);

router.get('/matches/:matchId', adminControllers.getSingleMatch);

module.exports = router;
