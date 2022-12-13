const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.post(
  "/create-user",
  [
    body("username").custom(async (value) => {
      return await User.findOne({ username: value }).then((user) => {
        if (user) {
          return Promise.reject("Username already exist");
        }
      });
    }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password minimum length is 5"),
  ],
  isAuth,
  authController.createUser
);

router.post("/login", authController.login);
router.get("/users", isAuth, authController.getUsers);
router.delete("/delete-user/:userId", isAuth, authController.deleteUser);
router.put("/update-user/:userId", isAuth, authController.updateUser);

module.exports = router;
