const express = require("express");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const tripRoutes = require("./routes/office/trip");
const authRoutes = require("./routes/auth");

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

app.use("/trip", tripRoutes);
app.use("/auth", authRoutes);

// Error Cb
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Database connection
mongoose
  .connect(process.env.DB_CONN)
  .then(() => app.listen(8080))
  .catch((err) => console.log(err));
