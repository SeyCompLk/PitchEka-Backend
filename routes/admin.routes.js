const adminControllers = require('../controllers/admin.controller');
const router = require('express').Router();
const { verifyAdmin } = require('../utils/verifyToken');

router.post('/login', adminControllers.postLogin);

router.post('/register', adminControllers.postRegister);

router.post('/add-match', verifyAdmin, adminControllers.postMatch);

router.put('/update-match/:matchId', verifyAdmin, adminControllers.updateMatch);

router.put('/update-score/:matchId', verifyAdmin, adminControllers.updateScore);

router.get('/matches', verifyAdmin, adminControllers.getMatches);

router.get('/matches/:matchId', verifyAdmin, adminControllers.getSingleMatch);

module.exports = router;
