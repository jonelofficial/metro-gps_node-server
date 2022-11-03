const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  plate_no: {
    type: String,
    required: true,
  },
  vehicle_type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  fuel_type: {
    type: String,
    required: true,
  },
  km_per_liter: {
    type: Number,
    required: true,
  },
  profile: {
    type: String,
  },
  department: { type: String },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
