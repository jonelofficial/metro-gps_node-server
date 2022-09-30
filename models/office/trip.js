const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    trip_date: {
      type: Date,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle_id: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    odometer: {
      type: Number,
      required: true,
    },
    odometer_done: {
      type: Number,
      required: true,
    },
    odometer_image_path: {
      type: String,
    },
    companion: {
      type: String,
    },
    points: {
      type: JSON,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripOffice", tripSchema);
