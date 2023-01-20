const User = require("../models/user");
const GasStation = require("../models/gas_station");
const Vehicle = require("../models/vehicle");
const Trip = require("../models/office/trip");
const { getPathLength } = require("geolib");
const dayjs = require("dayjs");

exports.TotalTripDriver = (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  const searchBy = req.query.searchBy == "null" ? "driver" : req.query.searchBy;

  let filteredData = {};

  Trip.find()
    .populate("locations")
    .populate("diesels")
    .populate("user_id")
    .populate("vehicle_id")
    .then((result) => {
      result.forEach((item) => {
        const driver = item.user_id._id;
        if (!filteredData[driver]) {
          filteredData[driver] = {
            employee_id: item.user_id.employee_id,
            driver: `${item.user_id.first_name} ${item.user_id.last_name}`,
            trip: 1,
            department: item.user_id.department,
          };
        } else {
          filteredData[driver].trip++;
        }
      });

      const obj = Object.values(filteredData);

      return obj.filter((trip) => {
        const searchItem = search.toLowerCase();
        const searchProps = searchBy.split(".");
        let obj = trip;
        for (const prop of searchProps) {
          if (prop === "department") {
            obj = obj.department;
          } else if (
            prop === "trip" ||
            obj[prop] !== 0 ||
            obj[prop] !== null ||
            obj[prop] !== undefined
          ) {
            obj = obj[prop].toString();
          } else {
            obj = obj[prop];
          }
          console.log(prop);
          console.log(obj);

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

exports.LongestTravelDuration = (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  const searchBy = req.query.searchBy == "null" ? "_id" : req.query.searchBy;

  let filteredData = [];

  Trip.find()
    .populate("locations")
    .populate("diesels")
    .populate("user_id")
    .populate("vehicle_id")
    .then((result) => {
      result.forEach((trip) => {
        const startDate = dayjs(trip.locations[0].date);
        const endDate = dayjs(trip.locations[trip.locations.length - 1].date);
        const duration = endDate.diff(startDate);

        filteredData.push({
          _id: trip._id,
          duration: duration,
          plate_no: trip.vehicle_id.plate_no,
          departure: trip.locations[0].date,
          arrival: trip.locations[trip.locations.length - 1].date,
        });
      });

      const obj = filteredData
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 20);

      return obj.filter((trip) => {
        const searchItem = search.toLowerCase();
        const searchProps = searchBy.split(".");
        let obj = trip;
        for (const prop of searchProps) {
          if (
            prop !== "duration" ||
            obj[prop] !== 0 ||
            obj[prop] !== null ||
            obj[prop] !== undefined
          ) {
            obj = obj[prop].toString();
          } else {
            obj = obj[prop];
          }

          if (!obj) return false;
        }
        return obj.toString().toLowerCase().includes(searchItem);
      });
    })
    .then((data) => {
      res.status(201).json({
        message: "done",
        data: data.slice(
          (page - 1) * limit,
          parseInt((page - 1) * limit) + parseInt(limit)
        ),
        pagination: {
          totalItems: data.slice(
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

exports.HighestKMrun = (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || "";
  const searchBy = req.query.searchBy == "null" ? "_id" : req.query.searchBy;

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

      const obj = filteredData.sort((a, b) => b.km - a.km).slice(0, 20);

      return obj.filter((trip) => {
        searchItem = search.toLowerCase();
        const searchProps = searchBy.split(".");
        let obj = trip;
        for (const prop of searchProps) {
          if (
            prop !== "km" ||
            obj[prop] !== 0 ||
            obj[prop] !== null ||
            obj[prop] !== undefined
          ) {
            obj = obj[prop].toString();
          } else {
            obj = obj[prop];
          }
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
          filteredData.slice(0, 20);
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
