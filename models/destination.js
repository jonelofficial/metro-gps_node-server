const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Destination = new Schema(
  {
    destination: {
      type: String,
      required: true,
      index: false,
      unique: false,
    },
    trip_type: {
      type: String,
      required: true,
    },
    trip_category: {
      type: String,
      required: true,
    },
    trip_template: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", Destination);
