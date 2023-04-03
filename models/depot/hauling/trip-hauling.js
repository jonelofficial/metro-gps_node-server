const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    trip_date: {
      type: Date,
      required: true,
    },
    trip_type: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    farm: {
      type: String,
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
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "LocationHauling",
      },
    ],
    diesels: [{ type: Schema.Types.ObjectId, ref: "DieselHauling" }],
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
    charging: {
      type: String,
    },
    companion: {
      type: JSON,
    },
    points: {
      type: JSON,
    },
    temperature: {
      type: Number,
    },
    tare_weight: {
      type: Number,
    },
    gross_weight: {
      type: Number,
    },
    net_weigth: {
      type: Number,
    },
    doa_count: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripHauling", tripSchema);
