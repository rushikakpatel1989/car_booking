
const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/profile', auth, role('admin'), ctrl.profile);

module.exports = router;
