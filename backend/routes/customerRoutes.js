
const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/profile', auth, role('customer'), ctrl.profile);
router.post('/rides', auth, role('customer'), rideController.createRide);
router.post('/fare', auth, role('customer'), rideController.getFareEstimate);

router.post("/cancel", auth, rideController.cancelRide);
router.get("/ride/:id", auth, rideController.getRide);
router.get("/history/list", auth, rideController.getRideHistory);
router.get("/upcoming/list", auth, rideController.getUpcomingRides);

router.get("/rides/:rideId/invoice", auth, rideController.getInvoice);

router.get("/drivers/nearby", auth, rideController.getNearbyDrivers);

module.exports = router;
