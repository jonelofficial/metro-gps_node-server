const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gasStationSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GasStation", gasStationSchema);
