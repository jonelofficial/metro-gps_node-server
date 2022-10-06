const fs = require("fs");
const path = require("path");

const Trip = require("../../models/office/trip");
const Location = require("../../models/office/location");
const Diesel = require("../../models/office/diesel");

exports.searchUserTrip = (req, res, next) => {
  const searchDate = req.query.searchDate;
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  Trip.find({
    trip_date: {
      $gte: `${searchDate}T00:00:00`,
      $lte: `${searchDate}T23:59:59`,
    },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Trip.find({
        trip_date: {
          $gte: `${searchDate}T00:00:00`,
          $lte: `${searchDate}T23:59:59`,
        },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("locations")
        .populate("diesels")
        .populate("user_id", { trip_template: 1 })
        .populate("vehicle_id", { name: 1 })
        .sort({ trip_date: "desc" });
    })
    .then((result) => {
      if (result.length === 0) {
        const error = new Error("Could not found trip");
        error.statusCode = 404;
        res.status(404).json({
          message: "Could not found trip",
          data: result,
          pagination: {
            totalItems: totalItems,
            currentPage: parseInt(currentPage),
          },
        });
        throw error;
      }
      res.status(201).json({
        message: "Success search trip",
        data: result,
        pagination: {
          totalItems: totalItems,
          currentPage: parseInt(currentPage),
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUserTrip = (req, res, next) => {
  const userId = req.userId;
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  Trip.find({ user_id: userId })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Trip.find({ user_id: userId })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("locations")
        .populate("diesels")
        .populate("user_id", { trip_template: 1 })
        .populate("vehicle_id", { name: 1 })
        .sort({ trip_date: "desc" });
    })
    .then((result) => {
      res.status(201).json({
        message: "Fetch trip successfully",
        data: result,
        pagination: {
          totalItems: totalItems,
          currentPage: parseInt(currentPage),
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getTrips = (req, res, next) => {
  // office/trips?page=
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  Trip.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Trip.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        message: "Fetch trip successfully",
        data: result,
        pagination: {
          totalItems: totalItems,
          currentPage: parseInt(currentPage),
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createTrip = async (req, res, next) => {
  console.log(req);
  let newImageUrl;
  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  const user_id = req.userId;
  const vehicle_id = req.body.vehicle_id;
  const odometer = req.body.odometer;
  const odometer_done = req.body.odometer_done || null;
  const odometer_image_path = newImageUrl || null;
  const companion = req.body.companion;
  const points = req.body.points || null;

  const trip = new Trip({
    user_id: user_id,
    vehicle_id: vehicle_id,
    odometer: odometer,
    odometer_done: odometer_done,
    odometer_image_path: odometer_image_path,
    companion: companion,
    points: points,
  });

  trip
    .save()
    .then((result) => {
      res
        .status(201)
        .json({ message: "Trip created successfully", data: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateTrip = (req, res, next) => {
  console.log(req);
  const tripId = req.params.tripId;
  let newImageURL;

  if (req.file) {
    newImageURL = req.file.path.replace("\\", "/");
  }

  const user_id = req.body.user_id || null;
  const vehicle_id = req.body.vehicle_id || null;
  const odometer = req.body.odometer || null;
  const odometer_done = req.body.odometer_done || null;
  const odometer_image_path = newImageURL || null;
  const companion = req.body.companion || null;
  const points = req.body.points || null;

  Trip.findById(tripId)
    .then((trip) => {
      if (!trip) {
        const error = new Error("Could not find trip");
        res.status(404).json({ message: "Couldn not find user" });
        error.statusCode = 404;
        throw error;
      }

      if (req.file && odometer_image_path !== trip.odometer_image_path) {
        clearImage(trip.odometer_image_path);
      }

      trip.user_id = user_id || trip.user_id;
      trip.vehicle_id = vehicle_id || trip.vehicle_id;
      trip.odometer = odometer || trip.odometer;
      trip.odometer_done = odometer_done || trip.odometer_done;
      trip.odometer_image_path =
        odometer_image_path || trip.odometer_image_path;
      trip.companion = companion || trip.companion;
      trip.points = points || trip.points;

      return Trip.findOneAndUpdate(
        { _id: trip._id },
        {
          user_id: user_id || trip.user_id,
          vehicle_id: vehicle_id || trip.vehicle_id,
          odometer: odometer || trip.odometer,
          odometer_done: odometer_done || trip.odometer_done,
          odometer_image_path: odometer_image_path || trip.odometer_image_path,
          companion: companion || trip.companion,
          points: points || trip.points,
        }
      )
        .populate("locations")
        .populate("diesels")
        .populate("user_id", { trip_template: 1 })
        .populate("vehicle_id", { name: 1 });
    })
    .then((result) => {
      res.status(200).json({
        messsage: "Trip update successfully",
        data: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteTrip = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  const tripId = req.params.tripId;

  Trip.findById(tripId)
    .then((trip) => {
      if (!trip) {
        const error = new Error("Could not found trip");
        res.status(404).json({ message: "Could not find user" });
        error.statusCode = 404;
        throw error;
      }

      if (trip?.odometer_image_path) {
        clearImage(trip.odometer_image_path);
      }

      // Delete all location related to trip id
      Location.find({ trip_id: tripId }).then((location) => {
        if (!location) {
          return null;
        }
        location.map(async (item) => {
          await Location.findByIdAndRemove(item._id);
        });
      });

      // Delete all diesel related to trip id
      Diesel.find({ trip_id: tripId }).then((diesel) => {
        if (!diesel) {
          return null;
        }
        diesel.map(async (item) => {
          await Diesel.findByIdAndRemove(item._id);
        });
      });

      return Trip.findByIdAndRemove(tripId);
    })
    .then((result) => {
      res.status(200).json({
        message: "Success delete trip",
        data: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
