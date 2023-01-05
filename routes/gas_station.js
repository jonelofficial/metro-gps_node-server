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

router.post("/import-stations", isAuth, gasStationController.importGasStations);
router.delete(
  "/delete-all-stations",
  isAuth,
  gasStationController.deleteAllStations
);

module.exports = router;
