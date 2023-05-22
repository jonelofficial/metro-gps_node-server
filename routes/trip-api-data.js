const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const tripTemplateController = require("../controllers/trip_template");
const TripTemplate = require("../models/trip_template");

const tripCategoryController = require("../controllers/trip_category");
const TripCategory = require("../models/trip_category");

const tripTypeController = require("../controllers/trip_type");
const TripType = require("../models/trip_type");

const destinationsController = require("../controllers/destination");
const Destination = require("../models/destination");

const isAuth = require("../middleware/is-auth");

// TRIP TEMPLATE
router.get("/trip-template", isAuth, tripTemplateController.getTemplate);
router.post(
  "/trip-template",
  [
    body("template").custom(async (value) => {
      return await TripTemplate.findOne({ template: value }).then((isExist) => {
        if (isExist) {
          return Promise.reject("Template already exist");
        }
      });
    }),
  ],
  isAuth,
  tripTemplateController.createTemplate
);
router.put(
  "/trip-template/:templateId",
  [
    body("template").custom(async (value) => {
      return await TripTemplate.findOne({ template: value }).then((isExist) => {
        if (isExist) {
          return Promise.reject("Template already exist");
        }
      });
    }),
  ],
  isAuth,
  tripTemplateController.updateTemplate
);
router.post(
  "/import-trip-template",
  isAuth,
  tripTemplateController.importTemplate
);

// TRIP CATEGORY
router.get("/trip-category", isAuth, tripCategoryController.getCategory);
router.post(
  "/trip-category",
  [
    body().custom(async (obj) => {
      return await TripCategory.findOne(obj).then((isExist) => {
        if (isExist) {
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
    body().custom(async (obj) => {
      return await TripCategory.findOne(obj).then((isExist) => {
        if (isExist) {
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

// TRIP TYPE
router.get("/trip-type", isAuth, tripTypeController.getTripType);
router.post(
  "/trip-type",
  [
    body().custom(async (obj) => {
      return await TripType.findOne(obj).then((isExist) => {
        if (isExist) {
          return Promise.reject("Type already exist");
        }
      });
    }),
  ],
  isAuth,
  tripTypeController.createTripType
);
router.put(
  "/trip-type/:typeId",
  [
    body().custom(async (obj) => {
      const { type, trip_category } = obj;
      return await TripType.findOne({
        type: type,
        trip_category: trip_category,
      }).then((isExist) => {
        if (isExist) {
          return Promise.reject("Data already exist");
        }
      });
    }),
  ],
  isAuth,
  tripTypeController.updateTripType
);
router.post("/import-trip-type", isAuth, tripTypeController.importTripTypes);

// DESTINATIONS
router.get("/destinations", isAuth, destinationsController.getDestinations);
router.post(
  "/destination",
  [
    body().custom(async (obj) => {
      const { destination, trip_category, trip_type } = obj;
      return await Destination.findOne({
        destination: destination,
        trip_type: trip_type,
        trip_category: trip_category,
      }).then((isExist) => {
        if (isExist) {
          return Promise.reject("Data already exist");
        }
      });
    }),
  ],
  isAuth,
  destinationsController.createDestination
);
router.put(
  "/destination/:destinationId",
  [
    body().custom(async (obj) => {
      const { destination, trip_type, trip_category } = obj;
      return await Destination.findOne({
        destination: destination,
        trip_category: trip_category,
        trip_type: trip_type,
      }).then((isExist) => {
        if (isExist) {
          return Promise.reject("Data already exist");
        }
      });
    }),
  ],
  isAuth,
  destinationsController.updateDestination
);
router.post(
  "/import-destinations",
  isAuth,
  destinationsController.importDestinations
);

module.exports = router;
