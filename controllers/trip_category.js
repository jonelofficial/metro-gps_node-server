const { validationResult } = require("express-validator");
const TripCategory = require("../models/trip_category");

exports.createCategory = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { category, trip_template } = req.body;

  const tripCategory = new TripCategory({
    category: category,
    trip_template: trip_template,
  });

  tripCategory
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Success create trip category",
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

exports.updateCategory = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  const { category, trip_template } = req.body;

  const categoryId = req.params.categoryId;

  TripCategory.findById(categoryId)
    .then((isExist) => {
      if (!isExist) {
        const error = new Error("Could not find data");
        error.statusCode = 404;
        throw error;
      }

      return TripCategory.findOneAndUpdate(
        { _id: categoryId },
        { category: category, trip_template: trip_template },
        { new: true }
      );
    })
    .then((result) => {
      res.status(200).json({
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

exports.getCategory = (req, res, next) => {
  const query = req.query;

  const currentPage = query.page || 1;
  const perPage = query.limit || 0;
  const searchItem = query.search || "";
  const searchBy = query.searchBy === "_id" ? "category" : query.searchBy;

  let totalItems;

  TripCategory.find({
    [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
  })
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return TripCategory.find({
        [searchBy]: { $regex: `.*${searchItem}.*`, $options: "i" },
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ createAt: "desc" });
    })
    .then((result) => {
      res.status(201).json({
        message: "Success get trip category",
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

exports.importTripCategories = async (req, res, next) => {
  const categories = req.body;

  if (categories.length > 0) {
    for (const { category, trip_template } of categories) {
      try {
        const isExist = await TripCategory.findOne({
          category: category,
          trip_template: trip_template,
        });

        if (!isExist) {
          await TripCategory.create({
            category: category,
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
    res.status(201).json({
      message: "Success import trip categories",
    });
  } else {
    res.status(404).json({ message: "No item found" });
  }
};
