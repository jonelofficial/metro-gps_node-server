const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

const dashboardController = require("../controllers/dashboard");

router.get("/tvdt-department", isAuth, dashboardController.TVDTdeparment);
router.get("/highest-km", isAuth, dashboardController.HighestKMrun);
router.get(
  "/longest-duration",
  isAuth,
  dashboardController.LongestTravelDuration
);
router.get("/total-trip-driver", isAuth, dashboardController.TotalTripDriver);

module.exports = router;
