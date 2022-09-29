const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  employee_id: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  trip_template: {
    type: String,
    required: true,
  },
  trips: [
    {
      type: Schema.Types.ObjectId,
      ref: "Trip",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
