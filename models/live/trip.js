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
    locations: [{ type: Schema.Types.ObjectId, ref: "LocationLive" }],
    diesels: [{ type: Schema.Types.ObjectId, ref: "DieselLive" }],
    odometer: {
      type: Number,
      required: true,
    },
    odometer_done: {
      type: Number,
    },
    odometer_image_path: {
      type: String,
    },
    odometer_done_image_path: {
      type: String,
    },
    others: {
      type: String,
    },
    charging: {
      type: String,
    },
    companion: {
      type: JSON,
    },
    points: {
      type: JSON,
    },
    trip_type: {
      type: String,
      required: true,
    },
    total_bags: {
      type: Number,
    },
    total_bags_delivered: {
      type: Number,
    },
    transactions: {
      type: JSON,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripLive", tripSchema);
