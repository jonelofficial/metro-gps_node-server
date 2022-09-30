const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gasStationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("GasStation", gasStationSchema);
