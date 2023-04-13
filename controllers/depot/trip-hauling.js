const fs = require("fs");
const path = require("path");

const TripHauling = require("../../models/depot/hauling/trip-hauling");
const Location = require("../../models/depot/hauling/location");
const Diesel = require("../../models/depot/hauling/diesel");
const { validationResult } = require("express-validator");
const diesel = require("../../models/office/diesel");

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.createApkTripHauling = (req, res, next) => {
  let newImageUrl;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Valdiation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  const {
    trip_date,
    trip_type,
    destination,
    farm,
    vehicle_id,
    odometer,
    odometer_done,
    companion,
    others,
    points,
    charging,
    temperature,
    tare_weight,
    gross_weight,
    net_weight,
    doa_count,
  } = req.body;

  const tripObj = {
    user_id: req.userId,
    trip_date: trip_date || new Date(),
    trip_type: trip_type,
    destination: destination,
    farm: farm,
    vehicle_id: vehicle_id,
    odometer: odometer,
    odometer_done: odometer_done || null,
    odometer_image_path: newImageUrl || null,
    companion: companion || [],
    others: others || "",
    points: (points && JSON.parse(points)) || [],
    charging: charging || null,
    temperature: (temperature && JSON.parse(temperature)) || [],
    tare_weight: (tare_weight && JSON.parse(tare_weight)) || [],
    gross_weight: (gross_weight && JSON.parse(gross_weight)) || [],
    net_weight: (net_weight && JSON.parse(net_weight)) || [],
    doa_count: doa_count || null,
  };

  let trip_id;

  TripHauling.create(tripObj)
    .then(async (result) => {
      trip_id = result;

      const locationsPromises = (JSON.parse(req.body.locations) || []).map(
        async (location) => {
          return await Location.create({ trip_id: trip_id, ...location }).then(
            (result) => {
              return result._id;
            }
          );
        }
      );

      const dieselsPromises = (JSON.parse(req.body.diesels) || []).map(
        async (diesel) => {
          return await Diesel.create({ trip_id: trip_id, ...diesel }).then(
            (result) => {
              return result._id;
            }
          );
        }
      );

      const [locationsIds, dieselsIds] = await Promise.all([
        Promise.all(locationsPromises),
        Promise.all(dieselsPromises),
      ]);

      return { locationsIds, dieselsIds };
    })
    .then(async (result) => {
      const trip = await TripHauling.findOneAndUpdate(
        { _id: trip_id },
        {
          $push: { diesels: result.dieselsIds, locations: result.locationsIds },
        },
        { new: true }
      )
        .populate("locations")
        .populate("diesels")
        .populate("user_id", {
          employee_id: 1,
          first_name: 2,
          last_name: 3,
          department: 4,
        })
        .populate("vehicle_id", { plate_no: 1, name: 2 });

      res
        .status(201)
        .json({ message: "Done creating apk hauling trip", data: trip });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getApkTripHauling = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 25;
  let searchItem = req.query.search || "";
  const dateItem = req.query.date;

  const filter =
    dateItem !== "null"
      ? {
          user_id: req.userId,
          ["trip_date"]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : { user_id: req.userId };

  TripHauling.find(filter)
    .populate("locations")
    .populate("diesels")
    .populate("user_id", {
      employee_id: 1,
      first_name: 2,
      last_name: 3,
      department: 4,
      trip_template: 5,
    })
    .populate("vehicle_id", { plate_no: 1, name: 2 })
    .sort({ createdAt: "desc" })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((result) => {
      res.status(200).json({
        data: result,
        pagination: {
          totalItems: result.length,
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

exports.getTripHauling = (req, res, next) => {
  const query = req.query;
  const currentPage = query.page || 1;
  const perPage = query.limit || 25;
  let searchItem = query.search || "";
  const searchBy = query.searchBy || "_id";
  const dateItem = query.date;
  const userDepartment = req?.department;
  const show_all_departments = req?.show_all_departments;

  const filter =
    searchBy === "trip_date" || searchBy === "createdAt"
      ? {
          [searchBy]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : {};

  TripHauling.find(filter)
    .populate("locations")
    .populate("diesels")
    .populate("user_id", {
      employee_id: 1,
      first_name: 2,
      last_name: 3,
      department: 4,
    })
    .populate("vehicle_id", { plate_no: 1 })
    .sort({ createdAt: "desc" })
    .then((trips) => {
      const newTrip = trips.filter((trip) => {
        if (show_all_departments) {
          return trip;
        } else {
          return trip?.user_id?.department.toString().includes(userDepartment);
        }
      });

      if (searchBy === "trip_date" || searchBy === "createdAt") {
        return newTrip;
      } else {
        return newTrip.filter((trip) => {
          searchItem = searchItem.toLowerCase();
          const searchProps = searchBy.split(".");
          let obj = trip;

          for (const prop of searchProps) {
            obj = obj[prop];

            if (Array.isArray(obj)) {
              if (prop === "companion") {
                return obj.find((el) =>
                  el.first_name.toString().toLowerCase().includes(searchItem)
                );
              }

              return obj.find(
                (el) => el && el.toString().toLowerCase().includes(searchItem)
              );
            }

            if (!obj) return false;
          }

          return obj.toString().toLowerCase().includes(searchItem);
        });
      }
    })
    .then((result) => {
      res.status(200).json({
        data:
          perPage <= 0 || perPage === "undefined"
            ? result
            : result.slice(
                (currentPage - 1) * perPage,
                parseInt((currentPage - 1) * perPage) + parseInt(perPage)
              ),
        pagination: {
          totalItems: result.length,
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
