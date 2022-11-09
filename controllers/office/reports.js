const Trip = require("../../models/office/trip");
const Location = require("../../models/office/location");
const Diesel = require("../../models/office/diesel");

exports.getTripsReport = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 100;
  let totalItems;

  Trip.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Trip.find({})
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .select({ _id: 1, location: 2, diesels: 3, user_id: 4, vehicle_id: 5 })
        .populate("locations", { date: 1, status: 2, address: 3 })
        .populate("diesels", {
          gas_station_id: 1,
          gas_station_name: 2,
          liter: 3,
          amount: 4,
        })
        .populate("user_id", { trip_template: 1, first_name: 2, last_name: 3 })
        .populate("vehicle_id", { plate_no: 1 })
        .sort({ trip_date: "desc" });
    })
    .then((result) => {
      res.status(201).json({
        message: "Success get trip reports",
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
