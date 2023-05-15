const TripDelivery = require("../../models/depot/delivery/trip-delivery");
const Location = require("../../models/depot/delivery/location");
const Diesel = require("../../models/depot/delivery/diesel");

exports.createApkTripDelivery = (req, res, next) => {
  let newImageUrl;

  if (req.file) {
    newImageUrl = req.file.path.replace("\\", "/");
  }

  const {
    trip_date,
    trip_type,
    trip_category,
    destination,
    vehicle_id,
    locations,
    diesels,
    odometer,
    odometer_done,
    others,
    charging,
    companion,
    points,
    temperature,
    crates_dropped,
    crates_collected,
    crates_borrowed,
  } = req.body;

  const tripObj = {
    user_id: req.userId,
    trip_date: trip_date || new Date(),
    trip_category,
    trip_type,
    destination,
    vehicle_id,
    odometer,
    odometer_done,
    odometer_image_path: newImageUrl || null,
    others,
    charging,
    companion: (companion && JSON.parse(companion)) || [],
    points: (points && JSON.parse(points)) || [],
    temperature,
    crates_dropped: (crates_dropped && JSON.parse(crates_dropped)) || [],
    crates_collected: (crates_collected && JSON.parse(crates_collected)) || [],
    crates_borrowed: (crates_borrowed && JSON.parse(crates_borrowed)) || [],
  };

  let trip_id;

  TripDelivery.create(tripObj)
    .then(async (result) => {
      trip_id = result._id;

      const locationsPromises = JSON.parse(locations)?.map(async (location) => {
        return await Location.create({ trip_id: trip_id, ...location }).then(
          (result) => {
            return result._id;
          }
        );
      });

      const dieselsPromises = JSON.parse(diesels)?.map(async (diesel) => {
        return await Diesel.create({ trip_id: trip_id, ...diesel }).then(
          (result) => {
            return result._id;
          }
        );
      });

      const [locationsIds, dieselsIds] = await Promise.all([
        Promise.all(locationsPromises),
        Promise.all(dieselsPromises),
      ]);

      return { locationsIds, dieselsIds };
    })
    .then(async (result) => {
      const trip = await TripDelivery.findOneAndUpdate(
        { _id: trip_id },
        {
          $push: { diesels: result.dieselsIds, locations: result.locationsIds },
        },
        { new: true }
      )
        .populate("diesels")
        .populate({ path: "locations", options: { sort: { data: 1 } } })
        .populate("user_id", {
          employee_id: 1,
          first_name: 2,
          last_name: 3,
          department: 4,
        })
        .populate("vehicle_id", { plate_no: 1, name: 2 });

      res
        .status(201)
        .json({ message: "Done creating apk delivery trip", data: trip });
    })
    .catch(async (err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getApkTripDelivery = (req, res, next) => {
  const { query } = req;

  const currentPage = query.page || 1;
  const perPage = query.limit || 25;
  const dateItem = query.date;
  const userId = req.userId;

  const filter =
    dateItem !== "null"
      ? {
          user_id: userId,
          ["trip_date"]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : { user_id: userId };

  TripDelivery.find(filter)
    .populate("user_id", {
      employee_id: 1,
      first_name: 2,
      last_name: 3,
      department: 4,
      trip_template: 5,
    })
    .populate({
      path: "locations",
      options: { sort: { date: 1 } },
    })
    .populate("vehicle_id", { plate_no: 1, name: 2 })
    .populate("diesels")
    .sort({ createdAt: "desc" })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((trips) => {
      res.status(200).json({
        message: "Success get apk delivery trips",
        data: trips,
        pagination: {
          totalItems: trips.length,
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

exports.getTripDelivery = (req, res, next) => {
  const { query } = req;
  const currentPage = query.page || 1;
  const perPage = query.limit || 25;
  const searchItem = query?.search?.toLowerCase() || "";
  const searchBy = query.searchBy || "_id";
  const dateItem = query.date;
  const userDepartment = req?.department;
  const show_all_departments = req?.show_all_departments;
  let newTrips = [];

  const filter =
    searchBy === "trip_date" || searchBy === "createdAt"
      ? {
          [searchBy]: {
            $gte: `${dateItem}T00:00:00`,
            $lte: `${dateItem}T23:59:59`,
          },
        }
      : {};

  TripDelivery.find(filter)
    .populate("user_id", {
      employee_id: 1,
      first_name: 2,
      last_name: 3,
      department: 4,
    })
    .populate({ path: "locations", options: { sort: { date: 1 } } })
    .populate("vehicle_id", { plate_no: 1 })
    .populate("diesels")
    .sort({ createdAt: "desc" })
    .then((trips) => {
      if (show_all_departments) {
        newTrips = trips;
      } else {
        newTrips = trips.filter((trip) => {
          return trip?.user_id?.department.toString().includes(userDepartment);
        });
      }

      if (searchBy === "trip_date" || searchBy === "createdAt") {
        return newTrips;
      } else {
        return newTrips.filter((trip) => {
          const searchProps = searchBy.split(".");
          let obj = trip;

          for (const prop of searchProps) {
            obj = obj[prop];

            if (Array.isArray(obj)) {
              return obj.find((el) =>
                el.toString().toLowerCase().includes(searchItem)
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
        message: "Success get delivery trips",
        data: result,
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
