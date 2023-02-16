const express = require("express");
const router = express.Router();

const tripController = require("../../controllers/office/trip");
const isAuth = require("../../middleware/is-auth");

router.get("/trips", isAuth, tripController.getTrips);
router.post("/trip", isAuth, tripController.createTrip);
router.put("/trip/:tripId", isAuth, tripController.updateTrip);
router.delete("/trip/:tripId", isAuth, tripController.deleteTrip);
router.delete("/trips/:userId", isAuth, tripController.deleteAllTrips);

router.post("/apk-trip", isAuth, tripController.createApkTrip);
router.get("/apk-trips", isAuth, tripController.getApkTrips);

//:page
router.get("/trips/user", isAuth, tripController.getUserTrip);
//:searhDate&page
router.get("/trips/search", isAuth, tripController.searchUserTrip);
//:vehicleId
router.get("/trips/vehicle", isAuth, tripController.vehicleTrip);

module.exports = router;
