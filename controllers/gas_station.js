const GasStation = require("../models/gas_station");

exports.getStation = (req, res, next) => {
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  GasStation.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return GasStation.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        message: "Fetched gas stations successfully",
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

exports.createStation = (req, res, next) => {
  const name = req.body.name;

  const station = new GasStation({
    name: name,
  });

  station
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Success create gas station",
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

exports.updateStation = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 500;
    throw error;
  }
  const stationId = req.params.stationId;

  const name = req.body.name;

  GasStation.findById(stationId)
    .then((station) => {
      if (!station) {
        const error = new Error("Station not found");
        error.statusCode = 500;
        throw error;
      }

      station.name = name;

      return station.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Success update station",
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

exports.deleteStation = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 500;
    throw error;
  }
  const stationId = req.params.stationId;

  GasStation.findById(stationId)
    .then((station) => {
      if (!station) {
        const error = new Error("Could not found station");
        error.statusCode = 500;
        throw error;
      }

      return GasStation.findByIdAndRemove(stationId);
    })
    .then((result) => {
      res.status(201).json({
        message: "Success delete station",
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
