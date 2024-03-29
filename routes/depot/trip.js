const express = require("express");
const router = express.Router();

const tripHauilingController = require("../../controllers/depot/trip-hauling");
const tripDeliveryController = require("../../controllers/depot/trip-delivery");
const isAuth = require("../../middleware/is-auth");

// Hauling
router.get(
  "/apk-trips-hauling",
  isAuth,
  tripHauilingController.getApkTripHauling
);
router.get("/trips-hauling", isAuth, tripHauilingController.getTripHauling);
router.post(
  "/trip-hauling",
  isAuth,
  tripHauilingController.createApkTripHauling
);
router.put(
  "/trip-hauling/:tripId",
  isAuth,
  tripHauilingController.updateTripHauling
);

// Delivery
router.get("/trips-delivery", isAuth, tripDeliveryController.getTripDelivery);
router.get(
  "/apk-trips-delivery",
  isAuth,
  tripDeliveryController.getApkTripDelivery
);
router.post(
  "/trip-delivery",
  isAuth,
  tripDeliveryController.createApkTripDelivery
);
router.put(
  "/trip-delivery/:tripId",
  isAuth,
  tripDeliveryController.updateTripDelivery
);
module.exports = router;
