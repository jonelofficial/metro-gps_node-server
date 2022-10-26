const Diesel = require("../../models/office/diesel");
const Trip = require("../../models/office/trip");

exports.getDiesel = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;
  Diesel.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Diesel.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        message: "Fetched diesel successfully",
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

exports.createDiesel = (req, res, next) => {
  // const gas_station_id = req.body.gas_station_id;
  // const gas_station_name = req.body?.gas_station_name || null;
  const trip_id = req.body.trip_id;
  const odometer = req.body.odometer;
  const liter = req.body.liter;
  const lat = req.body.lat;
  const long = req.body.long;
  const amount = req.body.amount;

  const diesel = new Diesel({
    // gas_station_id: gas_station_id,
    // gas_station_name: gas_station_name,
    trip_id: trip_id,
    odometer: odometer,
    liter: liter,
    lat: lat,
    long: long,
    amount: amount,
  });

  diesel
    .save()
    .then((result) => {
      Trip.findById({ _id: trip_id })
        .then((trip) => {
          trip.diesels = [...trip.diesels, { _id: result.id }];

          return trip.save();
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      res.status(201).json({
        message: "Success create diesel",
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
