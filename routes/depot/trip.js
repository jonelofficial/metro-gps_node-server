const express = require("express");
const router = express.Router();

const tripHauilingController = require("../../controllers/depot/trip-hauling");
const tripDeliveryController = require("../../controllers/depot/trip-delivery");
const isAuth = require("../../middleware/is-auth");

router.get("/trips-hauling", isAuth, tripHauilingController.getTripHauling);
router.get("/trips-delivery", isAuth, tripDeliveryController.getTripDelivery);

module.exports = router;
