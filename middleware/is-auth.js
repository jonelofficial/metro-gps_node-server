const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

module.exports = (req, res, next) => {
  // Authorizaton : Bearer "TOKEN"
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.role = decodedToken?.role;
  req.show_all_departments = decodedToken?.show_all_departments;
  req.department = decodedToken?.department;
  next();
};
