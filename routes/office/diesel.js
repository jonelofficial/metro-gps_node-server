const express = require("express");

const dieselController = require("../../controllers/office/diesel");
const isAuth = require("../../middleware/is-auth");

const router = express.Router();

router.get("/diesels", isAuth, dieselController.getDiesel);
router.post("/diesel", isAuth, dieselController.createDiesel);
router.post("/diesel/bulk", isAuth, dieselController.createBulkDiesel);

module.exports = router;
