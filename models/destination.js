const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Destination = new Schema({
  destination: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Destination", Destination);
