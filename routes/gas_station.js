const express = require("express");

const router = express.Router();

const gasStationController = require("../controllers/gas_station");
const isAuth = require("../middleware/is-auth");

router.get("/stations", gasStationController.getStation);
router.post("/station", isAuth, gasStationController.createStation);
router.put("/station/:stationId", isAuth, gasStationController.updateStation);
router.delete(
  "/station/:stationId",
  isAuth,
  gasStationController.deleteStation
);

module.exports = router;
