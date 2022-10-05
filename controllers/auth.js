const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
require("dotenv").config();

const User = require("../models/user");

exports.updateUser = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    res.status(403).json({ message: "Please make sure you're an admin" });
    throw error;
  }

  const userId = req.params.userId;
  let newImageURl;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    throw err;
  }

  if (req.file) {
    newImageURl = req.file.path.replace("\\", "/");
  }

  const employee_id = req.body.employee_id || null;
  const first_name = req.body.first_name || null;
  const last_name = req.body.last_name || null;
  const username = req.body.username || null;
  const password = req.body.password || null;
  const trip_template = req.body.trip_template || null;
  const role = req.body.role || null;
  const profile = newImageURl || null;
  // image validation here

  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user");
        res.status(404).json({ message: "Could not find user" });
        error.statusCode = 404;
        throw error;
      }

      if (profile !== user.profile && user.profile) {
        clearImage(user.profile);
      }

      req.body.password &&
        bcrypt
          .hash(password, 12)
          .then((hashedPw) => {
            user.employee_id = employee_id || user.employee_id;
            user.first_name = first_name || user.first_name;
            user.last_name = last_name || user.last_name;
            user.username = username || user.username;
            user.password = hashedPw || user.password;
            user.trip_template = trip_template || user.trip_template;
            user.role = role || user.role;
            user.profile = profile || user.profile;
            return user.save();
          })
          .then((result) => {
            res.status(200).json({ message: "User udpated", user: result });
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      user.employee_id = employee_id || user.employee_id;
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      user.username = username || user.username;
      user.trip_template = trip_template || user.trip_template;
      user.role = role || user.role;
      user.profile = profile || user.profile;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "User udpated", user: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteUser = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    res.status(403).json({ message: "Please make sure you're an admin" });
    throw error;
  }

  const userId = req.params.userId;
  User.findById(userId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find user");
        res.status(404).json({ message: "Could not find user" });
        error.statusCode = 404;
        throw error;
      }
      post?.profile && clearImage(post.profile);
      return User.findByIdAndRemove(userId);
    })
    .then((result) => {
      res.status(200).json({ message: "Success delete user" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCOde = 500;
      }
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  if (req.role !== "admin") {
    const error = new Error("Please make sure you're an admin");
    error.statusCode = 403;
    res.status(403).json({ message: "Please make sure you're an admin" });
    throw error;
  }
  // auth/users?page=
  const currentPage = req.query.page;
  const perPage = 25;
  let totalItems;

  User.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return User.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        message: "Fetch user successfully",
        data: result,
        pagination: {
          totalItems: totalItems,
          currentPage: parseInt(currentPage),
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createUser = (req, res, next) => {
  const error = validationResult(req);
  let newImageURl;
  if (!error.isEmpty()) {
    const errorMsg = [];
    error.errors.map((item) => errorMsg.push(item.msg));
    const err = new Error(errorMsg);
    err.statusCode = 422;
    throw err;
  }
  if (req.file) {
    newImageURl = req.file.path.replace("\\", "/");
  }

  const employee_id = req.body.employee_id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const username = req.body.username;
  const password = req.body.password;
  const trip_template = req.body.trip_template;
  const role = req.body.role;
  const profile = newImageURl;

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        employee_id: employee_id,
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: hashedPw,
        trip_template: trip_template,
        role: role,
        profile: profile,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "User created",
        user_id: result.id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user");
        error.statusCode = 401;

        res.status(401).json({ message: "Could not find user", user: user });
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Password");
        error.statusCode = 401;

        res.status(401).json({ message: "Wrong Password", user: [] });
        throw error;
      }
      const token = jwt.sign(
        {
          userId: loadedUser._id.toString(),
          role: loadedUser?.role,
          profile: loadedUser.profile,
          first_name: loadedUser.first_name,
          last_name: loadedUser.last_name,
          trip_template: loadedUser.trip_template,
        },
        process.env.SECRET_KEY
        // { expiresIn: "12h" }
      );
      res.status(201).json({ token: token });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
