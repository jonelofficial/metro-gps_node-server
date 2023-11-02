const TripLive = require("../../models/live/trip");
const Location = require("../../models/live/location");
const Diesel = require("../../models/live/diesel");

const formatDateToYYYYMMDD = (date) => {
  const { year, month, day } = {
    year: date.getFullYear(),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: String(date.getDate()).padStart(2, "0"),
  };

  return `${year}-${month}-${day}`;
};

exports.updateTripLive = (req, res, next) => {
  const tripId = req.params.tripId;

  const {
    odometer,
    odometer_done,
    charging,
    total_bags,
    total_bags_delivered,
  } = req.body;

  TripLive.findById(tripId)
    .then((trip) => {
      if (!trip) {
        const error = new Error("Could not found trip");
        error.statusCode = 404;
        throw error;
      }

      return TripLive.findOneAndUpdate(
        { _id: trip._id },
        {
          odometer: odometer || trip.odometer,
          odometer_done: odometer_done || trip.odometer_done,
          charging: charging || trip.charging,
          total_bags: total_bags || trip.total_bags,
          total_bags_delivered:
            total_bags_delivered || trip.total_bags_delivered,
        },
        { new: true }
      );
    })
    .then((result) => {
      res.status(200).json({ message: "Done updating trip", data: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createApkTripLive = (req, res, next) => {
  let odometer_image_path;
  let odometer_done_image_path;

  if (req?.files?.length >= 2) {
    odometer_image_path = req.files[0].path.replace("\\", "/");
    odometer_done_image_path = req.files[1].path.replace("\\", "/");
  }

  const {
    trip_date,
    vehicle_id,
    locations,
    diesels,
    odometer,
    odometer_done,
    others,
    charging,
    companion,
    points,
    trip_type,
    total_bags,
    total_bags_delivered,
    transactions,
  } = req.body;

  const tripObj = {
    user_id: req.userId,
    trip_date: trip_date || new Date(),
    vehicle_id,
    odometer,
    odometer_done: odometer_done || null,
    odometer_image_path: odometer_image_path || null,
    odometer_done_image_path: odometer_done_image_path || null,
    others: others || "",
    charging: charging || null,
    companion: (companion && JSON.parse(companion)) || [],
    points: (points && JSON.parse(points)) || [],
    trip_type,
    total_bags,
    total_bags_delivered,
    transactions: (transactions && JSON.parse(transactions)) || [],
  };

  let trip_id;

  TripLive.create(tripObj)
    .then(async (result) => {
      trip_id = result.id;

      const locationsPromises = (
        (locations && JSON.parse(locations)) || [
          {
            date: "2023-08-03T05:43:45.471Z",
            lat: 15.0751218,
            long: 120.536597,
            status: "left",
            address: [
              {
                postalCode: null,
                country: "Philippines",
                isoCountryCode: "PH",
                subregion: "Pampanga",
                city: "Porac",
                street: null,
                district: null,
                name: "3GGP+2FX",
                streetNumber: null,
                region: "Central Luzon",
                timezone: null,
              },
            ],
            destination: "Depot",
          },
          {
            date: "2023-08-03T05:43:49.001Z",
            lat: 15.0751097,
            long: 120.5365983,
            status: "arrived",
            address: [
              {
                postalCode: null,
                country: "Philippines",
                isoCountryCode: "PH",
                subregion: "Pampanga",
                city: "Porac",
                street: null,
                district: null,
                name: "3GGP+2FX",
                streetNumber: null,
                region: "Central Luzon",
                timezone: null,
              },
            ],
            destination: "Clark",
          },
        ]
      ).map(async (location) => {
        return await Location.create({ trip_id: trip_id, ...location }).then(
          (result) => {
            return result._id;
          }
        );
      });

      const dieselsPromises = (
        (diesels && JSON.parse(diesels)) || [
          {
            gas_station_id: "63ce1ffdf05b440dbd697d9a",
            gas_station_name: "Total",
            odometer: 348197,
            liter: 21.19,
            lat: 15.0836639,
            long: 120.6077547,
            amount: 1443.63,
            __v: 0,
          },
        ]
      ).map(async (diesel) => {
        return await Diesel.create({ trip_id: trip_id, ...diesel }).then(
          (result) => {
            return result.id;
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
      const trip = await TripLive.findOneAndUpdate(
        { _id: trip_id },
        {
          $push: { diesels: result.dieselsIds, locations: result.locationsIds },
        },
        { new: true }
      )
        .populate({ path: "locations", options: { sort: { date: 1 } } })
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
        .json({ message: "Done creating apk live trip", data: trip });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getApkTripLive = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 25;
  const dateItem = req.query.date || formatDateToYYYYMMDD(new Date());

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

  TripLive.find(filter)
    .populate({ path: "locations", options: { sort: { date: 1 } } })
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
        message: "Success get apk live trips",
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

exports.getTripLive = (req, res, next) => {
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

  TripLive.find(filter)
    .populate({ path: "locations", options: { sort: { date: 1 } } })
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
        message: "Success get live trips",
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
