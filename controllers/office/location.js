const Location = require("../../models/office/location");
const Trip = require("../../models/office/trip");

exports.getLocations = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  Location.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Location.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
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

exports.createBulkLocation = async (req, res, next) => {
  const locations = req.body;
  const tripId = req.query.id;
  let totalLocations = 0;
  let locObj = [];

  let counter = 0;
  while (counter < 100) {
    if (totalLocations == locations.length) {
      break;
    } else {
      totalLocations = 0;
      locObj = [];
      counter++;
    }
    for (let i = 0; i < locations.length; i++) {
      const location = new Location({
        trip_id: tripId,
        lat: locations[i].lat,
        long: locations[i].long,
        status: locations[i].status,
        address: locations[i].address,
        odometer: locations[i].odometer || null,
        date: locations[i].date || Date.now,
      });
      await location
        .save()
        .then((result) => {
          totalLocations++;
          locObj.push(result.id);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  }

  await Trip.findById({ _id: tripId })
    .then((trip) => {
      trip.locations = [...trip.locations, ...locObj];
      return trip.save();
    })
    .then((result) => {
      // console.log(
      //   `Loc ${totalLocations} | Length ${locations.length} | Res ${result.locations.length}`
      // );
      res.status(201).json({
        message: "Success create bulk location",
        tally:
          totalLocations == locations.length &&
          totalLocations == result.locations.length,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createLocation = (req, res, next) => {
  const trip_id = req.body.trip_id;
  const lat = req.body.lat;
  const long = req.body.long;
  const status = req.body.status;
  const address = req.body.address;
  const odometer = req.body.odometer || null;
  const date = req.body.date || Date.now;

  const location = new Location({
    trip_id: trip_id,
    lat: lat,
    long: long,
    status: status,
    address: address,
    odometer: odometer,
    date: date,
  });

  location
    .save()
    .then((result) => {
      Trip.findById({ _id: trip_id })
        .then((trip) => {
          trip.locations = [...trip.locations, { _id: result.id }];

          return trip.save();
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      res.status(201).json({
        message: "Success create location",
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
