const express = require("express");
const router = express.Router();

const tripController = require("../../controllers/office/trip");
const isAuth = require("../../middleware/is-auth");

router.get("/trips", isAuth, tripController.getTrips);
router.post("/trip", isAuth, tripController.createTrip);
router.put("/trip/:tripId", isAuth, tripController.updateTrip);
router.delete("/trip/:tripId", isAuth, tripController.deleteTrip);

//:page
router.get("/trips/user", isAuth, tripController.getUserTrip);
//:searhDate&page
router.get("/trips/search", isAuth, tripController.searchUserTrip);

module.exports = router;
