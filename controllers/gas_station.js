const { isObjectIdOrHexString } = require("mongoose");
const GasStation = require("../models/gas_station");
var ObjectId = require("mongoose").Types.ObjectId;

exports.getStation = (req, res, next) => {
  let totalItems;
  let newList;

  GasStation.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return GasStation.find();
    })
    .then((result) => {
      newList = [
        ...result,
        { _id: ObjectId("507f191e810c19729de860ea"), label: "Others" },
      ];
      res.status(200).json({
        message: "Fetched gas stations successfully",
        data: newList,
        pagination: {
          totalItems: totalItems + 1,
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
  const label = req.body.label;

  const station = new GasStation({
    label: label,
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

  const label = req.body.label;

  GasStation.findById(stationId)
    .then((station) => {
      if (!station) {
        const error = new Error("Station not found");
        error.statusCode = 500;
        throw error;
      }

      station.label = label;

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
