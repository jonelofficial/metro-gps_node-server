const express = require("express");

const router = express.Router();
const vehicleController = require("../controllers/vehicle");
const isAuth = require("../middleware/is-auth");

router.get("/cars", isAuth, vehicleController.getVehicles);
router.post("/car", isAuth, vehicleController.createVehicle);
router.put("/car/:vehicleId", isAuth, vehicleController.updateVehicle);
router.delete("/car/:vehicleId", isAuth, vehicleController.deleteVehicle);

module.exports = router;
