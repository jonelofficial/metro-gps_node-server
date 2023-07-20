const express = require("express");
const router = express.Router();

const tripLiveController = require("../../controllers/live/trip-live");
const isAuth = require("../../middleware/is-auth");

router.get("/apk-trips-live", isAuth, tripLiveController.getApkTripLive);

router.get("/trips-live", isAuth, tripLiveController.getTripLive);

router.post("/trip-live", isAuth, tripLiveController.createApkTripLive);

router.put("/trip-live/:tripId", isAuth, tripLiveController.updateTripLive);

module.exports = router;
