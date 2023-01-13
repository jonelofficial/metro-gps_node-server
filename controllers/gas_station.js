// const { isObjectIdOrHexString } = require("mongoose");
const GasStation = require("../models/gas_station");
var ObjectId = require("mongoose").Types.ObjectId;

exports.deleteAllStations = async (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  await GasStation.deleteMany({})
    .then(() => {
      res.status(200).json({
        message: "Success delete all gas stations",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.importGasStations = async (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    throw error;
  }

  const stations = req.body;

  stations.length > 0
    ? await stations.forEach(async (station, index) => {
        await GasStation.findOne({ label: station.label })
          .then((isStation) => {
            if (!isStation) {
              GasStation.create({
                label: station.label,
              });
            }
          })
          .then(() => {
            if (index === stations.length - 1) {
              res.status(200).json({
                message: "Success import gas stations",
                totalItem: stations.length,
              });
            }
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      })
    : res.status(404).json({ message: "no item found" });
};

exports.getStation = (req, res, next) => {
  let totalItems;
  let newList;

  const currentPage = req.query.page || 1;
  const perPage = req.query.limit || 0;
  const searchItem = req.query.search || "";
  const searchBy = req.query.searchBy || "label";

  GasStation.find({
    [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return GasStation.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: "desc" });
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

exports.createStation = (req, res, next) => {
  const label = req.body.label;

  GasStation.find({ label: label })
    .then((result) => {
      if (result.length > 0) {
        res.status(409).json({ error: `Label "${label}" already exist` });
      } else {
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
      }
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

  GasStation.find({ label: label })
    .then((result) => {
      if (
        result.length <= 0 ||
        (result.length <= 1 && stationId == result[0]._id)
      ) {
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
      } else {
        res.status(409).json({ error: `Label "${label}" already exist` });
      }
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
