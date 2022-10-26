const express = require("express");
const path = require("path");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "/.env" });

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicle");
const gasStationRoutes = require("./routes/gas_station");

const officeTripRoutes = require("./routes/office/trip");
const officeDieselStationRoutes = require("./routes/office/diesel");
const officeLocationStationRoutes = require("./routes/office/location");

const app = express();

// Images Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParse.json());

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

// END IMAGE UPLOAD

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Origin", "Content-Type , Authorization");
  next();
});

// Authentication
app.use("/auth", authRoutes);
// Vehicle
app.use("/vehicle", vehicleRoutes);
//  Gas Station
app.use("/gas-station", gasStationRoutes);

// Office Routes
app.use("/office", officeTripRoutes);
app.use("/office", officeLocationStationRoutes);
app.use("/office", officeDieselStationRoutes);

// Hauling Routes
// Delivery Routes
// Feeds Delivery Routes

// Error Cb
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ error: message, data: data });
});
// Database connection
mongoose
  .connect(process.env.DB_CONN)
  .then(() => app.listen(8080))
  .catch((err) => console.log(err));
