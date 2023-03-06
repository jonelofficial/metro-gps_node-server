const fs = require("fs");
const path = require("path");
const Trip = require("../../models/office/trip");
const Location = require("../../models/office/location");
const Diesel = require("../../models/office/diesel");

exports.createApkTrip = (req, res, next) => {
  let newImageUrl;
  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  let trip_id;
  const diesels = JSON.parse(req.body.diesels) || [];
  const locations = JSON.parse(req.body.locations) || [];

  const tripObj = {
    user_id: req.userId,
    vehicle_id: req.body.vehicle_id,
    odometer: req.body.odometer || null,
    odometer_done: req.body.odometer_done || null,
    odometer_image_path: newImageUrl || null,
    companion: JSON.parse(req.body.companion) || null,
    others: req.body.others || "",
    points: JSON.parse(req.body.points) || [],
    trip_date: req.body.trip_date || new Date(),
  };

  Trip.create(tripObj)
    .then(async (result) => {
      trip_id = result._id;

      const locationsPromises = await locations.map(async (location) => {
        return Location.create({ trip_id: trip_id, ...location }).then(
          async (result) => {
            if (result?._id) {
              await Trip.findById({ _id: trip_id }).then((trip) => {
                trip.locations.push(result._id);
                return trip.save();
              });
            }
          }
        );
      });

      const dieselsPromises = await diesels.map(async (diesel) => {
        return Diesel.create({ trip_id: trip_id, ...diesel }).then(
          async (result) => {
            if (result?._id) {
              await Trip.findById({ _id: trip_id }).then((trip) => {
                trip.diesels.push(result._id);
                return trip.save();
              });
            }
          }
        );
      });

      return Promise.all([...locationsPromises, ...dieselsPromises]);
    })
    .then(() => {
      Trip.findById({ _id: trip_id })
        .populate("locations")
        .populate("diesels")
        .populate("user_id", {
          employee_id: 1,
          first_name: 2,
          last_name: 3,
          department: 4,
        })
        .populate("vehicle_id", { plate_no: 1, name: 2 })
        .then((trip) => {
          res
            .status(201)
            .json({ message: "Done creating apk trip", data: trip });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getApkTrips = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 25;
  let searchItem = req.query.search || "";
  const dateItem = req.query.date;

  Trip.find(
    dateItem !== "null"
      ? {
          user_id: searchItem,
          ["trip_date"]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : { user_id: searchItem }
  )
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

exports.vehicleTrip = (req, res, next) => {
  const vehicleId = req.query.vehicleId;

  Trip.find({ vehicle_id: vehicleId })
    .limit(1)
    .sort({ trip_date: "desc" })
    .then((trip) => {
      if (!trip) {
        const error = new Error("Could not found vehicle trip");
        error.statusCode = 404;
        res.status(404).json({
          message: "Could not found vehicle trip",
          data: result,
        });
        throw error;
      }

      res.status(201).json({
        message: "Success get vehicle trip",
        data: {
          odometer: trip[0]?.odometer,
          odometer_done: trip[0]?.odometer_done,
          points: trip[0]?.points,
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
  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 25;
  let searchItem = req.query.search || "";
  const searchBy = req.query.searchBy || "_id";
  const dateItem = req.query.date;
  const userDepartment = req?.department;
  const employee_id = req?.employee_id;

  if (searchBy === "trip_date" || searchBy === "createdAt") {
    Trip.find({
      [searchBy]: {
        $gte: `${dateItem}T00:00:00`,
        $lte: `${dateItem}T23:59:59`,
      },
    })
      .populate("locations")
      .populate("diesels")
      .populate("user_id")
      .populate("vehicle_id")
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: "desc" })
      .then((trips) => {
        const newTrip = trips.filter((trip) => {
          // valdiation to not filter by department if user is audit or developer and support
          if (
            userDepartment === "INTERNAL AUDIT" ||
            employee_id === "RDFFLFI-10861" ||
            employee_id === "RDFFLFI-10693"
          ) {
            return trip;
          } else {
            return trip?.user_id?.department
              .toString()
              .includes(userDepartment);
          }
        });

        return newTrip;
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
  } else {
    Trip.find()
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
          // valdiation to not filter by department if user is audit or developer and support
          if (
            userDepartment === "INTERNAL AUDIT" ||
            employee_id === "RDFFLFI-10861" ||
            employee_id === "RDFFLFI-10693"
          ) {
            return trip;
          } else {
            return trip?.user_id?.department
              .toString()
              .includes(userDepartment);
          }
        });

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
  }
};

exports.createTrip = async (req, res, next) => {
  let newImageUrl;
  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  const user_id = req.userId;
  const vehicle_id = req.body.vehicle_id;
  const odometer = req.body.odometer;
  const odometer_done = req.body.odometer_done || null;
  const odometer_image_path = newImageUrl || null;
  const companion = JSON.parse(req.body.companion) || null;
  const others = req.body.others || null;
  const points = JSON.parse(req.body.points) || null;
  const trip_date = req.body.trip_date || new Date();

  const trip = new Trip({
    user_id: user_id,
    vehicle_id: vehicle_id,
    odometer: odometer,
    odometer_done: odometer_done,
    odometer_image_path: odometer_image_path,
    companion: companion,
    others: others,
    points: points,
    trip_date: trip_date,
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
  const others = req.body.others || null;
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
      trip.others = others || trip.others;
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
          others: others || trip.others,
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

exports.deleteAllTrips = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }
  const userId = req.params.userId;

  Trip.find({ user_id: userId })
    .then((trips) => {
      if (!trips) {
        const error = new Error("Could not find trip");
        error.statusCode = 404;
        throw error;
      }

      trips.map(async (item) => {
        await Location.find({ trip_id: item._id }).then((locations) => {
          locations.map(async (locItem) => {
            await Location.findByIdAndRemove(locItem._id);
          });
        });

        await Diesel.find({ trip_id: item._id }).then((diesels) => {
          diesels.map(async (diesel) => {
            await Diesel.findByIdAndRemove(diesel._id);
          });
        });

        await Trip.findByIdAndRemove(item._id);

        if (item?.odometer_image_path) {
          clearImage(item.odometer_image_path);
        }
      });

      res.status(201).json({ message: "delete all trips successfully" });
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
