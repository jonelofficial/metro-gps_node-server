const { validationResult } = require("express-validator");
const TripType = require("../models/trip_type");

exports.updateTripType = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const typeId = req.params.typeId;
  const { type, trip_category, trip_template } = req.body;

  TripType.findById(typeId)
    .then((isExist) => {
      if (!isExist) {
        const error = new Error("Could not found data");
        error.statusCode = 404;
        throw error;
      }
      return TripType.findOneAndUpdate(
        { _id: typeId },
        {
          type: type,
          trip_category: trip_category,
          trip_template: trip_template,
        },
        { new: true }
      );
    })
    .then((result) => {
      res.status(201).json({ message: "Success update station", data: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createTripType = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { type, trip_category, trip_template } = req.body;

  const tripType = new TripType({
    type: type,
    trip_category: trip_category,
    trip_template: trip_template,
  });

  tripType
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Success create trip type",
        date: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getTripType = (req, res, next) => {
  const query = req.query;

  const currentPage = query.page || 1;
  const perPage = query.limit || 0;
  const searchItem = query.search || "";
  const searchBy = query.searchBy === "_id" ? "type" : query.searchBy;

  let totalItems;

  TripType.find({
    [searchBy]: { $regex: `.*.${searchItem}*`, $options: "i" },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return TripType.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: "desc" });
    })
    .then((result) => {
      res.status(200).json({
        message: "Succes get trip type",
        data: result,
        pagination: {
          totalItems: totalItems,
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

exports.importTripTypes = async (req, res, next) => {
  const tripTypes = req.body;

  if (tripTypes.length > 0) {
    for (const { type, trip_category, trip_template } of tripTypes) {
      try {
        const isExist = await TripType.findOne({
          type: type,
          trip_category: trip_category,
          trip_template: trip_template,
        });
        if (!isExist) {
          await TripType.create({
            type: type,
            trip_category: trip_category,
            trip_template: trip_template,
          });
        }
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
    }
    res.status(200).json({
      message: "Success import trip types",
    });
  } else {
    res.status(404).json({ message: "No item found" });
  }
};
