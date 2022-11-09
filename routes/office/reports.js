const express = require("express");

const router = express.Router();

const reportController = require("../../controllers/office/reports");
const isAuth = require("../../middleware/is-auth");

router.get("/", isAuth, reportController.getTripsReport);

module.exports = router;
