const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ email: body.email });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({
    token,
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user._id,
  });
});

loginRouter.post("/admin", async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ email: body.email });
  if (user.privilege === 0) {
    return res.status(401).json({
      error: "The FBI is watching you should propably leave this site",
    });
  }
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({
    token,
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user._id,
    privilege: user.privilege,
  });
});

module.exports = loginRouter;
