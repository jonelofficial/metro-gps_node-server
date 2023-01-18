const User = require("../models/user");
const GasStation = require("../models/gas_station");
const Vehicle = require("../models/vehicle");
const Trip = require("../models/office/trip");

const isValidated = (req) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }
};

exports.TVDTdeparment = async (req, res, next) => {
  isValidated(req);

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  const searchBy = req.query.searchBy || "department";

  let filteredData = [];

  //   let vehicleData;
  //   let userData;

  Vehicle.find()
    .then((vehicleData) => {
      vehicleData.forEach((vehicle) => {
        let index = filteredData.findIndex(
          (obj) => obj.department === vehicle.department.label
        );
        if (index == -1) {
          filteredData.push({
            department: vehicle.department.label,
            vehiclesCount: 1,
            driversCount: 0,
          });
        } else {
          filteredData[index].vehiclesCount++;
        }
      });

      User.find()
        .then((userData) => {
          userData.map((user) => {
            let index = filteredData.findIndex(
              (obj) => obj.department === user.department.label
            );
            if (index == -1) {
              filteredData.push({
                department: user.department.label,
                vehiclesCount: 0,
                driversCount: 1,
              });
            } else {
              filteredData[index].driversCount++;
            }
          });
        })
        .then(() => {
          res.status(201).json({
            message: "done",
            data: filteredData.slice(
              (page - 1) * limit,
              parseInt((page - 1) * limit) + parseInt(limit)
            ),
            pagination: {
              totalItems: filteredData.length,
              currentPage: parseInt(page),
            },
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
