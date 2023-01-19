const User = require("../models/user");
const GasStation = require("../models/gas_station");
const Vehicle = require("../models/vehicle");
const Trip = require("../models/office/trip");
const { getPathLength } = require("geolib");

const isValidated = (req) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }
};

exports.HighestKMrun = (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  // const searchBy = req.query.searchBy == "null" ? "_id" : req.query.searchBy;
  const searchBy = req.query.searchBy || "_id";

  let filteredData = [];

  Trip.find()
    .populate("locations")
    .populate("diesels")
    .populate("user_id")
    .populate("vehicle_id")
    .then((tripData) => {
      tripData.forEach((trip) => {
        const meter = getPathLength(trip.points);
        const km = meter / 1000;
        filteredData.push({
          _id: trip._id,
          driver: `${trip.user_id.first_name} ${trip.user_id.last_name}`,
          km: km,
          plate_no: trip.vehicle_id.plate_no,
          locations: trip.locations,
        });
      });

      const obj = filteredData.sort((a, b) => b.km - a.km);

      return obj.filter((trip) => {
        searchItem = search.toLowerCase();
        const searchProps = searchBy.split(".");
        let obj = trip;
        for (const prop of searchProps) {
          obj = obj[prop];
          if (Array.isArray(obj)) {
            return obj.find(
              (el) => el && el.toString().toLowerCase().includes(searchItem)
            );
          }
          if (!obj) return false;
        }
        return obj.toString().toLowerCase().includes(searchItem);
      });
    })
    .then((result) => {
      res.status(201).json({
        message: "done",
        data: result.slice(
          (page - 1) * limit,
          parseInt((page - 1) * limit) + parseInt(limit)
        ),
        pagination: {
          totalItems: result.slice(
            (page - 1) * limit,
            parseInt((page - 1) * limit) + parseInt(limit)
          ).length,
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
};

exports.TVDTdeparment = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  const searchBy =
    req.query.searchBy == "null" ? "department" : req.query.searchBy;

  let filteredData = [];

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
          const newObj = filteredData.filter((item) => {
            searchItem = search.toLowerCase();
            const searchProps = searchBy.split(".");
            let obj = item;
            for (const prop of searchProps) {
              if (prop !== "department") {
                obj = obj[prop].toString();
              } else {
                obj = obj[prop];
              }
              if (!obj) return false;
            }
            return obj.toString().toLowerCase().includes(searchItem);
          });

          res.status(201).json({
            message: "done",
            data: newObj.slice(
              (page - 1) * limit,
              parseInt((page - 1) * limit) + parseInt(limit)
            ),
            pagination: {
              totalItems: filteredData.slice(
                (page - 1) * limit,
                parseInt((page - 1) * limit) + parseInt(limit)
              ).length,
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
