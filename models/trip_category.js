const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripCategorySchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
    trip_template: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripCategory", tripCategorySchema);
