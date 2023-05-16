const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const haulingDestinations = new Schema({
  destination: {
    type: String,
    required: true,
    unique: true,
  },
  trip_type: {
    type: String,
    required: true,
  },
  trip_category: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("haulingDestinations", haulingDestinations);
