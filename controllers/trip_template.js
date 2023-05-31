const { validationResult } = require("express-validator");
const TripTemplate = require("../models/trip_template");

exports.createTemplate = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { template } = req.body;

  const tripTemplate = new TripTemplate({ template: template });

  tripTemplate
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Success create trip template",
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

exports.updateTemplate = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { template } = req.body;
  const templateId = req.params.templateId;

  TripTemplate.findById(templateId)
    .then((isExist) => {
      if (!isExist) {
        const error = new Error("Could not find data");
        error.statusCode = 404;
        throw error;
      }

      return TripTemplate.findOneAndUpdate(
        { _id: templateId },
        { template: template },
        { new: true }
      );
    })
    .then((result) => {
      res.status(200).json({
        message: "Success update trip template",
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

exports.getTemplate = (req, res, next) => {
  const query = req.query;

  const currentPage = query.page || 1;
  const perPage = query.limit || 0;
  const searchItem = query.search || "";
  const searchBy = query.searchBy === "_id" ? "category" : query.searchBy;

  let totalItems;

  TripTemplate.find({
    [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return TripTemplate.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: "desc" });
    })
    .then((result) => {
      res.status(200).json({
        message: "Success get trip template",
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

exports.importTemplate = async (req, res, next) => {
  const templates = req.body;

  if (templates.length > 0) {
    for (const { template } of templates) {
      try {
        const isExist = await TripTemplate.findOne({ template: template });

        if (!isExist) {
          await TripTemplate.create({ template: template });
        }
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
    }
    res.status(201).json({ message: "Success import trip template" });
  } else {
    res.status(404).json({ message: "No item found" });
  }
};
