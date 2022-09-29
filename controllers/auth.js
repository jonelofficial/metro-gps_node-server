const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user");
        error.statusCode = 401;
        res.status(401).json({ message: "Could not find user", user: user });
        throw error;
      }
      if (user.password === password) {
        const token = jwt.sign(
          {
            first_name: user.first_name,
            trip_template: user.trip_template,
          },
          "somesecret",
          { expiresIn: "12h" }
        );
        res.status(201).json({ token: token });
      } else {
        res.status(401).json({ message: "Wrong Password", user: [] });
      }
    })
    .catch((err) => console.log("ERROR on login: ", err));
};
