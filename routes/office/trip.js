const express = require("express");
const router = express.Router();

const tripController = require("../../controllers/office/trip");
const isAuth = require("../../middleware/is-auth");

router.get("/trips", isAuth, tripController.getTrips);
router.put("/trip/:tripId", isAuth, tripController.updateTrip);
router.delete("/trip/:tripId", isAuth, tripController.deleteTrip);
router.delete("/trips/:userId", isAuth, tripController.deleteAllTrips);

router.post("/apk-trip", isAuth, tripController.createApkTrip);
router.get("/apk-trips", isAuth, tripController.getApkTrips);

module.exports = router;
