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

  const category = req.body.category;

  const tripCategory = new TripCategory({ category: category });

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

  const category = req.body.category;
  const categoryId = req.params.categoryId;

  TripCategory.findOneAndUpdate(
    { _id: categoryId },
    { category: category },
    { new: true }
  )
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
      res.status(200).json({
        message: "Success get trip category",
        data: result,
        pagination: {
          totalItmes: totalItems,
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

  categories.length > 0
    ? await categories.forEach(async ({ category }, index) => {
        await TripCategory.findOne({ category: category })
          .then((isExist) => {
            if (!isExist) {
              TripCategory.create({ category: category });
            }
          })
          .then(() => {
            if (index === categories.length - 1) {
              res.status(200).json({
                message: "Success import trip categories",
                totalItem: categories.length,
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
    : res.status(404).json({ message: "No item found" });
};
