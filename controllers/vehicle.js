const Vehicle = require("../models/vehicle");
const path = require("path");
const fs = require("fs");
const department = require("../utility/department");

exports.deleteAllVehicles = async (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  await Vehicle.deleteMany({})
    .then(() => {
      res.status(201).json({
        message: "Success delete all vehicles",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.importVehicles = async (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  const vehicles = req.body;

  vehicles.length > 0
    ? await vehicles.forEach(async (vehicle, index) => {
        let newDepartment = {};

        department.map((item) => {
          if (item.label === vehicle.department) {
            newDepartment = item;
          }
        });

        await Vehicle.findOne({ plate_no: vehicle.plate_no.replace(/\s/g, "") })
          .then((isVehicle) => {
            if (!isVehicle) {
              Vehicle.create({
                plate_no: vehicle.plate_no.replace(/\s/g, ""),
                vehicle_type: vehicle.vehicle_type,
                name: vehicle.name,
                brand: vehicle.brand,
                fuel_type: vehicle.fuel_type,
                km_per_liter: vehicle.km_per_liter,
                department: newDepartment,
                profile: vehicle.profile,
              });
            }
          })
          .then(() => {
            if (index === vehicles.length - 1) {
              res.status(201).json({
                message: "Success import vehicles",
                totalItem: vehicles.length,
              });
            }
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      })
    : res.status(404).json({ message: "no item found" });
};

exports.getUserVehicle = (req, res, next) => {
  const plateNo = req.query.plateNo;

  Vehicle.find({ plate_no: plateNo })
    .then((result) => {
      if (result.length === 0) {
        const error = new Error("Could not find vehicle");
        error.statusCode = 404;
        res.status(404).json({ error: "Could not find vehicle" });
        throw error;
      }

      res.status(201).json({ message: "Success get vehicle", data: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getVehicles = (req, res, next) => {
  let totalItems;

  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 0;
  const searchItem = req.query.search || "";
  const searchBy =
    req.query.searchBy === "_id" ? "plate_no" : req.query.searchBy;

  Vehicle.find({ [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" } })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Vehicle.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: "desc" });
    })
    .then((result) => {
      res.status(200).json({
        message: "Fetch trip successfully",
        data: result,
        pagination: {
          totalItems: totalItems,
          limit: parseInt(perPage),
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
  let newImageURL;
  if (req.file) {
    newImageURL = req.file.path.replace("\\", "/");
  }

  const plate_no = req.body.plate_no.replace(/\s/g, "");
  const vehicle_type = req.body.vehicle_type;
  const name = req.body.name;
  const brand = req.body.brand;
  const fuel_type = req.body.fuel_type;
  const km_per_liter = req.body.km_per_liter;
  // const department = req.body.department || null;
  const department = JSON.parse(req.body.department) || null;
  const profile = newImageURL;

  Vehicle.find({ plate_no: plate_no })
    .then((result) => {
      if (result.length > 0) {
        res
          .status(409)
          .json({ error: `Plate Number "${plate_no}" already exist` });
      } else {
        const vehicle = new Vehicle({
          plate_no: plate_no,
          vehicle_type: vehicle_type,
          name: name,
          brand: brand,
          fuel_type: fuel_type,
          km_per_liter: km_per_liter,
          department: department,
          profile: profile,
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
      }
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

  let newImageURL;
  if (req.file) {
    newImageURL = req.file.path.replace("\\", "/");
  }

  const vehicleId = req.params.vehicleId;

  const plate_no = req.body.plate_no || null;
  const vehicle_type = req.body.vehicle_type || null;
  const name = req.body.name || null;
  const brand = req.body.brand || null;
  const fuel_type = req.body.fuel_type || null;
  const km_per_liter = req.body.km_per_liter || null;
  // const department = req.body.department || null;
  const department = JSON.parse(req.body.department) || null;

  const profile = newImageURL || null;

  console.log(vehicleId);

  Vehicle.find({ plate_no: plate_no })
    .then((result) => {
      if (
        result.length <= 0 ||
        (result.length <= 1 && vehicleId == result[0]._id)
      ) {
        Vehicle.findById(vehicleId)
          .then((vehicle) => {
            if (!vehicle) {
              const error = new Error("Could not found vehicle");
              error.statusCode = 500;
              throw error;
            }

            if (
              profile !== vehicle.profile &&
              vehicle.profile &&
              profile != undefined
            ) {
              clearImage(vehicle.profile);
            }

            vehicle.plate_no = plate_no || vehicle.plate_no;
            vehicle.vehicle_type = vehicle_type || vehicle.vehicle_type;
            vehicle.name = name || vehicle.name;
            vehicle.brand = brand || vehicle.brand;
            vehicle.fuel_type = fuel_type || vehicle.fuel_type;
            vehicle.km_per_liter = km_per_liter || vehicle.km_per_liter;
            vehicle.department = department || vehicle.department;
            vehicle.profile = profile || vehicle.profile;

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
      } else {
        res
          .status(409)
          .json({ error: `Plate Number "${plate_no}" already exist` });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  // Vehicle.findById(vehicleId)
  //   .then((vehicle) => {
  //     if (!vehicle) {
  //       const error = new Error("Could not found vehicle");
  //       error.statusCode = 500;
  //       throw error;
  //     }

  //     if (
  //       profile !== vehicle.profile &&
  //       vehicle.profile &&
  //       profile != undefined
  //     ) {
  //       clearImage(vehicle.profile);
  //     }

  //     vehicle.plate_no = plate_no || vehicle.plate_no;
  //     vehicle.vehicle_type = vehicle_type || vehicle.vehicle_type;
  //     vehicle.name = name || vehicle.name;
  //     vehicle.brand = brand || vehicle.brand;
  //     vehicle.fuel_type = fuel_type || vehicle.fuel_type;
  //     vehicle.km_per_liter = km_per_liter || vehicle.km_per_liter;
  //     vehicle.department = department || vehicle.department;
  //     vehicle.profile = profile || vehicle.profile;

  //     return vehicle.save();
  //   })
  //   .then((result) => {
  //     res.status(201).json({
  //       message: "Success update vehicle",
  //       data: result,
  //     });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
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
        const error = new Error("Could not find vehicle");
        res.status(404).json({ message: "Could not find vehicle" });
        error.statusCode = 404;
        throw error;
      }

      vehicle?.profile && clearImage(vehicle.profile);
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
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
