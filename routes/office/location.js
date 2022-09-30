const express = require("express");

const locationController = require("../../controllers/office/location");
const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.get("/locations", isAuth, locationController.getLocations);
router.post("/location", isAuth, locationController.createLocation);

module.exports = router;
