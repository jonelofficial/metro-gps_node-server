const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tripTemplateSchema = new Schema(
  {
    template: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripTemplate", tripTemplateSchema);
