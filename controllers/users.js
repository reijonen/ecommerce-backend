const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

//get all users;
usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users.map((u) => u.toJSON()));
});

//get user by id
usersRouter.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "orders",
      select: "payment products status",
      populate: {
        path: "products",
        model: "Product",
        select: "info name",
      },
    })
    .populate("shoppingcart", { name: 1, info: 1 });
  res.json(user.toJSON());
});

usersRouter.put("/:id/editshoppingcart", async (req, res) => {
  const body = req.body;
  await User.findByIdAndUpdate(
    req.params.id,
    { shoppingcart: [...body.products] },
    { new: true }
  );
});

//create new user / register
usersRouter.post("/register", async (req, res) => {
  const body = req.body;

  if (body.password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be over 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

usersRouter.post("/registeradmin", async (req, res) => {
  const body = req.body;
  /*
  TODO
  remove this stupid shit from here please and do something smarter
  and yes this does not need to be an variable 
  */

  const adminpassword = "adminpassword";

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminpassword, saltRounds);

  const user = new User({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    privilege: body.privilege,
    passwordHash,
  });

  const savedUser = await user.save();

  /* 
  very fancy func where you send email to the person whos account you just created
  and you include the _random_ password you have created before you hash it
  */

  res.json(savedUser);
});

module.exports = usersRouter;
