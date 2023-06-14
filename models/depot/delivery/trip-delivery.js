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
    trip_category: {
      type: String,
      required: true,
    },
    destination: {
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
        ref: "LocationDelivery",
      },
    ],
    diesels: [{ type: Schema.Types.ObjectId, ref: "DieselDelivery" }],
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
    crates_transaction: {
      type: JSON,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripDelivery", tripSchema);
