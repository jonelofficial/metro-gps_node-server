const fs = require("fs");
const path = require("path");

const TripDelivery = require("../../models/depot/delivery/trip-delivery");
const Location = require("../../models/depot/delivery/location");
const Diesel = require("../../models/depot/delivery/diesel");
const { validationResult } = require("express-validator");

const clearImage = (filepath) => {
  filepath = path.join(__dirname, "../..", filepath);
  fs.unlink(filepath, (err) => console.log(err));
};

exports.getTripDelivery = (req, res, next) => {
  const {} = req.query;

  res.status(201).json({ message: "Success get trip delivery" });
};
