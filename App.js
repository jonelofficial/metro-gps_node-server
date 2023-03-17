const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "/.env" });

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicle");
const gasStationRoutes = require("./routes/gas_station");

const officeTripRoutes = require("./routes/office/trip");

const dashboardRoutes = require("./routes/dashboard");

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

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// request file size
app.use(bodyParse.json({ limit: "100mb" }));
app.use(bodyParse.urlencoded({ limit: "100mb", extended: true }));

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

// END IMAGE UPLOAD

// Authentication
app.use("/auth", authRoutes);
// Vehicle
app.use("/vehicle", vehicleRoutes);
//  Gas Station
app.use("/gas-station", gasStationRoutes);

// Office Routes
app.use("/office", officeTripRoutes);

// Hauling Routes
// Delivery Routes
// Feeds Delivery Routes

// Dashboard
app.use("/dashboard", dashboardRoutes);

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
  .then(() => app.listen(process.env.PORT || 8080))
  .catch((err) => console.log(err));
