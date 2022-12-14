const express = require("express");

const router = express.Router();
const vehicleController = require("../controllers/vehicle");
const isAuth = require("../middleware/is-auth");

router.get("/cars", vehicleController.getVehicles);
router.post("/car", isAuth, vehicleController.createVehicle);
router.put("/car/:vehicleId", isAuth, vehicleController.updateVehicle);
router.delete("/car/:vehicleId", isAuth, vehicleController.deleteVehicle);

//:plateNo
router.get("/car/user", isAuth, vehicleController.getUserVehicle);

router.post("/import-vehicles", isAuth, vehicleController.importVehicles);
router.delete(
  "/delete-all-vehicles",
  isAuth,
  vehicleController.deleteAllVehicles
);

module.exports = router;
