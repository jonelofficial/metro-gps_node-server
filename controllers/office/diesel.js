const Diesel = require("../../models/office/diesel");

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
  const gas_station = req.body.gas_station;
  const trip_id = req.body.trip_id;
  const odometer = req.body.odometer;
  const liter = req.body.liter;
  const lat = req.body.lat;
  const long = req.body.long;

  const diesel = new Diesel({
    gas_station: gas_station,
    trip_id: trip_id,
    odometer: odometer,
    liter: liter,
    lat: lat,
    long: long,
  });

  diesel
    .save()
    .then((result) => {
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
