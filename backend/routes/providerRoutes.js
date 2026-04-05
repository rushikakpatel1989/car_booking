
const router = require('express').Router();
const ctrl = require('../controllers/providerController');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require("../middleware/upload");
const documentController = require("../controllers/documentController");

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/profile', auth, role('provider'), ctrl.profile);
router.put('/updateLocation', auth, role('provider'), ctrl.updateLocation);
router.put('/goOnline', auth, role('provider'), ctrl.goOnline);



router.post("/assign", auth, role('provider'), rideController.assignDriver);
router.post("/start", auth, role('provider'), rideController.startRide);
router.post("/complete", auth, role('provider'), rideController.completeRide);
router.post("/payment", auth, role('provider'), rideController.confirmPayment);

router.get("/ride/:id", auth, rideController.getRideDriver);
router.get("/history/list", auth, rideController.getRideHistoryDriver);
router.get("/upcoming/list", auth, rideController.getUpcomingRidesDriver);


router.post("/uploadDocuments",auth,
upload.fields([
 { name: "license", maxCount: 1 },
 { name: "aadhar", maxCount: 1 },
 { name: "rc", maxCount: 1 }
]),
role('provider'),documentController.uploadDocuments);
/*
*/
module.exports = router;
