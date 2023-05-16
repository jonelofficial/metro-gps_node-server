const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const tripCategoryController = require("../controllers/trip_category");
const TripCategory = require("../models/trip_category");
const isAuth = require("../middleware/is-auth");

router.get("/trip-category", isAuth, tripCategoryController.getCategory);
router.post(
  "/trip-category",
  [
    body("category").custom(async (value) => {
      return await TripCategory.findOne({ category: value }).then((item) => {
        if (item) {
          return Promise.reject("Category already exist");
        }
      });
    }),
  ],
  isAuth,
  tripCategoryController.createCategory
);
router.put(
  "/trip-category/:categoryId",
  [
    body("category").custom(async (value) => {
      return await TripCategory.findOne({ category: value }).then((item) => {
        if (item) {
          return Promise.reject("Category already exist");
        }
      });
    }),
  ],
  isAuth,
  tripCategoryController.updateCategory
);
router.post(
  "/import-trip-categories",
  isAuth,
  tripCategoryController.importTripCategories
);

module.exports = router;
