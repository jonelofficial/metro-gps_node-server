const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripTypeDeliverySchema = new Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  trip_category: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TripTypeDelivery", tripTypeDeliverySchema);
