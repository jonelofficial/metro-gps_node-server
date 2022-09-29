const express = require("express");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");

const tripRoutes = require("./routes/trip");
const authRoutes = require("./routes/auth");

require("dotenv").config();

const app = express();

app.use(bodyParse.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Origin", "Content-Type , Authorization");
  next();
});

app.use("/trip", tripRoutes);
app.use("/auth", authRoutes);

// Database connection
mongoose
  .connect(process.env.DB_CONN)
  .then((result) => app.listen(8080))
  .catch((err) => console.log(err));
