const TripLive = require("../../models/live/trip");
const Location = require("../../models/live/location");
const Diesel = require("../../models/live/diesel");

exports.updateTripLive = (req, res, next) => {
  res.status(200).json({ message: "testing updateTripLive" });
};

exports.createApkTripLive = (req, res, next) => {
  res.status(200).json({ message: "testing createApkTripLive" });
};

exports.getApkTripLive = (req, res, nex) => {
  res.status(200).json({ message: "testing getApkTripLive" });
};

exports.getTripLive = (req, res, next) => {
  res.status(200).json({ message: "testing getTripLive" });
};
