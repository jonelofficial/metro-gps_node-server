const fs = require("fs");
const path = require("path");

const Trip = require("../../models/office/trip");

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

exports.createTrip = (req, res, next) => {
  let newImageUrl;
  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  // const trip_date = req.body.trip_date;
  const user_id = req.body.user_id;
  const vehicle_id = req.body.vehicle_id;
  const odometer = req.body.odometer;
  const odometer_done = req.body.odometer_done;
  const odometer_image_path = newImageUrl;
  const companion = req.body.companion;
  const points = JSON.parse(req.body.points);

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
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  const tripId = req.params.tripId;
  let newImageURL;

  if (req.file) {
    newImageURL = req.file.path.replace("\\", "/");
  }

  const user_id = req.body.user_id;
  const vehicle_id = req.body.vehicle_id;
  const odometer = req.body.odometer;
  const odometer_done = req.body.odometer_done;
  const odometer_image_path = newImageURL;
  const companion = req.body.companion;
  const points = req.body.points && JSON.parse(req.body.points);

  Trip.findById(tripId)
    .then((trip) => {
      if (!trip) {
        const error = new Error("Could not find trip");
        res.status(404).json({ message: "Couldn not find user" });
        error.statusCode = 404;
        throw error;
      }

      if (
        odometer_image_path !== trip.odometer_image_path &&
        trip.odometer_image_path
      ) {
        clearImage(trip.odometer_image_path);
      }
      trip.user_id = user_id;
      trip.vehicle_id = vehicle_id;
      trip.odometer = odometer;
      trip.odometer_done = odometer_done;
      trip.odometer_image_path = odometer_image_path;
      trip.companion = companion;
      trip.points = points;

      return trip.save();
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

      trip?.odometer_image_path && clearImage(trip.odometer_image_path);
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
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
