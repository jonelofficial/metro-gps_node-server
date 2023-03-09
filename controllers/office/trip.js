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
    charging: req.body.charging || null,
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

exports.getTrips = (req, res, next) => {
  // office/trips?page=
  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 25;
  let searchItem = req.query.search || "";
  const searchBy = req.query.searchBy || "_id";
  const dateItem = req.query.date;
  const userDepartment = req?.department;
  const employee_id = req?.employee_id;

  Trip.find(
    searchBy === "trip_date" || searchBy === "createdAt"
      ? {
          [searchBy]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : null
  )
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Trip.find(
        searchBy === "trip_date" || searchBy === "createdAt"
          ? {
              [searchBy]: {
                $gte: `${dateItem}T00:00:00`,
                $lte: `${dateItem}T23:59:59`,
              },
            }
          : null
      )
        .populate("locations")
        .populate("diesels")
        .populate("user_id", {
          employee_id: 1,
          first_name: 2,
          last_name: 3,
          department: 4,
        })
        .populate("vehicle_id", { plate_no: 1 })
        .skip(searchItem !== "" ? null : (currentPage - 1) * perPage)
        .limit(searchItem !== "" ? 0 : perPage)
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
                      el.first_name
                        .toString()
                        .toLowerCase()
                        .includes(searchItem)
                    );
                  }
                  return obj.find(
                    (el) =>
                      el && el.toString().toLowerCase().includes(searchItem)
                  );
                }
                if (!obj) return false;
              }
              return obj.toString().toLowerCase().includes(searchItem);
            });
          }
        });
    })
    .then((result) => {
      res.status(200).json({
        data: result,
        pagination: {
          totalItems: searchItem === "" ? totalItems : result.length,
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
  const charging = req.body.charging || null;

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
      trip.charging = charging || trip.charging;

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
          charging: charging || trip.charging,
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
