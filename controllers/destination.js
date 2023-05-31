const { validationResult } = require("express-validator");
const Destination = require("../models/destination");

exports.createDestination = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { destination, trip_type, trip_category, trip_template } = req.body;

  const newDestination = new Destination({
    destination: destination,
    trip_type: trip_type,
    trip_category: trip_category,
    trip_template: trip_template,
  });

  newDestination
    .save()
    .then((result) => {
      res
        .status(201)
        .json({ message: "Success creating destination", result: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateDestination = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const destinationId = req.params.destinationId;
  const { destination, trip_type, trip_category, trip_template } = req.body;

  Destination.findById(destinationId)
    .then((isExist) => {
      if (!isExist) {
        const error = new Error("Could not find data");
        error.statusCode = 404;
        throw error;
      }
      return Destination.findOneAndUpdate(
        { _id: destinationId },
        {
          destination: destination,
          trip_type: trip_type,
          trip_category: trip_category,
          trip_template: trip_template,
        },
        { new: true }
      );
    })
    .then((result) => {
      res
        .status(200)
        .json({ message: "Success updating destination", data: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getDestinations = (req, res, next) => {
  const query = req.query;

  const currentPage = query.page || 1;
  const perPage = query.limit || 0;
  const searchItem = query.search || "";
  const searchBy = query.searchBy === "_id" ? "destination" : query.searchBy;

  let totalItems;

  Destination.find({
    [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return Destination.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: "desc" });
    })
    .then((result) => {
      res.status(200).json({
        message: "Success get destination",
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

exports.importDestinations = async (req, res, next) => {
  const destinations = req.body;

  if (destinations.length > 0) {
    for (const {
      destination,
      trip_type,
      trip_category,
      trip_template,
    } of destinations) {
      try {
        const isExist = await Destination.findOne({
          destination,
          trip_type,
          trip_category,
          trip_template,
        });
        if (!isExist) {
          await Destination.create({
            destination,
            trip_type,
            trip_category,
            trip_template,
          });
        }
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
    }

    res.status(201).json({
      message: "Success import destinations",
    });
  } else {
    res.status(404).json({ message: "No item found" });
  }
};
