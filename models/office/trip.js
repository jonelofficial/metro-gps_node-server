const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    trip_date: {
      type: Date,
      default: Date.now,
      // default: new Date().toString(),
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
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "LocationOffice",
      },
    ],
    diesels: [{ type: Schema.Types.ObjectId, ref: "DieselOffice" }],
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
    others: {
      type: String,
    },
    companion: {
      type: JSON,
    },
    points: {
      type: JSON,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripOffice", tripSchema);
