const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportSchema = new Schema({
  trip_id: {
    type: Schema.Types.ObjectId,
    ref: "TripOffice",
    required: true,
  },
  month: {
    type: String,
  },
  plate_no: {
    type: String,
  },
  driver_name: {
    type: String,
  },
  left: {
    type: JSON,
  },
  origin: {
    type: JSON,
  },
  destination: {
    type: JSON,
  },
  arrived: {
    type: JSON,
  },
  odometer: {
    type: Number,
  },
  odometer_done: {
    type: Number,
  },
  total_time: {
    type: String,
  },
  total_km: {
    type: Number,
  },
  companion: {
    type: JSON,
  },
  others: {
    type: JSON,
  },
});

module.exports = mongoose.model("Report", reportSchema);
