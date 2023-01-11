const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
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
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    trip_template: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    profile: {
      type: String,
    },
    license_exp: {
      type: Date,
    },
    status: {
      type: String,
      // required: true,
    },
    department: {
      type: Object,
      // required: true,
    },
    permission: {
      type: JSON,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
