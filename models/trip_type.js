const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripTypeDeliverySchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      index: false,
      unique: false,
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

module.exports = mongoose.model("TripType", tripTypeDeliverySchema);
