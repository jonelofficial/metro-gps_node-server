const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dieselSchema = new Schema({
  // gas_station_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: "GasStation",
  //   required: true,
  // },
  // gas_station_name: {
  //   type: String,
  //   required: true,
  // },
  trip_id: {
    type: Schema.Types.ObjectId,
    ref: "TripOffice",
    required: true,
  },
  odometer: {
    type: Number,
    required: true,
  },
  liter: {
    type: Number,
    required: true,
  },
  lat: {
    type: Number,
    require: true,
  },
  long: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DieselOffice", dieselSchema);
