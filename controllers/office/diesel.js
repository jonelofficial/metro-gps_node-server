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

exports.createBulkDiesel = async (req, res, next) => {
  const diesels = req.body;
  const tripId = req.query.id;
  let totalDiesels = 0;
  let dieselObj = [];

  let counter = 0;
  while (counter < 100) {
    if (totalDiesels === diesels.length) {
      break;
    } else {
      totalDiesels = 0;
      dieselObj = [];
      counter++;
    }

    for (let i = 0; i < diesels.length; i++) {
      const diesel = new Diesel({
        gas_station_id: diesels[i].gas_station_id,
        gas_station_name: diesels[i].gas_station_name,
        trip_id: tripId,
        odometer: diesels[i].odometer,
        liter: diesels[i].liter,
        lat: diesels[i].lat,
        long: diesels[i].long,
        amount: diesels[i].amount,
      });

      await diesel
        .save()
        .then((result) => {
          totalDiesels++;
          dieselObj.push(result.id);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  }

  Trip.findById({ _id: tripId })
    .then((trip) => {
      trip.diesels = [...trip.diesels, ...dieselObj];
      return trip.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Success create bulk diesel",
        tally:
          totalDiesels === diesels.length &&
          totalDiesels === result.diesels.length,
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
  const gas_station_id = req.body.gas_station_id;
  const gas_station_name = req.body?.gas_station_name || null;
  const trip_id = req.body.trip_id;
  const odometer = req.body.odometer;
  const liter = req.body.liter;
  const lat = req.body.lat;
  const long = req.body.long;
  const amount = req.body.amount;

  const diesel = new Diesel({
    gas_station_id: gas_station_id,
    gas_station_name: gas_station_name,
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
