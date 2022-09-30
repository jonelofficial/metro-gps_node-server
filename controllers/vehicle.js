const Vehicle = require("../models/vehicle");

exports.getVehicles = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  Vehicle.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Vehicle.find()
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

exports.createVehicle = (req, res, next) => {
  const plate_no = req.body.plate_no;
  const vehicle_type = req.body.vehicle_type;
  const name = req.body.name;
  const brand = req.body.brand;
  const fuel_type = req.body.fuel_type;
  const km_per_liter = req.body.km_per_liter;

  const vehicle = new Vehicle({
    plate_no: plate_no,
    vehicle_type: vehicle_type,
    name: name,
    brand: brand,
    fuel_type: fuel_type,
    km_per_liter: km_per_liter,
  });

  vehicle
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Success create vehicle",
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

exports.updateVehicle = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 500;
    throw error;
  }

  const vehicleId = req.params.vehicleId;

  const plate_no = req.body.plate_no;
  const vehicle_type = req.body.vehicle_type;
  const name = req.body.name;
  const brand = req.body.brand;
  const fuel_type = req.body.fuel_type;
  const km_per_liter = req.body.km_per_liter;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      if (!vehicle) {
        const error = new Error("Could not found vehicle");
        error.statusCode = 500;
        throw error;
      }

      vehicle.plate_no = plate_no;
      vehicle.vehicle_type = vehicle_type;
      vehicle.name = name;
      vehicle.brand = brand;
      vehicle.fuel_type = fuel_type;
      vehicle.km_per_liter = km_per_liter;

      return vehicle.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Success update vehicle",
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

exports.deleteVehicle = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 500;
    throw error;
  }

  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      if (!vehicle) {
        const error = new Error("Could not found vehicle");
        error.statusCode = 500;
        throw error;
      }

      return Vehicle.findByIdAndRemove(vehicleId);
    })
    .then((result) => {
      res.status(201).json({
        message: "Success delete vehicle",
        data: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(500);
    });
};