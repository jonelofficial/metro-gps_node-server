const fs = require("fs");
const path = require("path");

const TripHauling = require("../../models/depot/hauling/trip-hauling");
const Location = require("../../models/depot/hauling/location");
const Diesel = require("../../models/depot/hauling/diesel");
const { validationResult } = require("express-validator");

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.getTripHauling = (req, res, next) => {
  const {} = req.query;

  res.status(201).json({ message: "Success get trip hauling." });
};
