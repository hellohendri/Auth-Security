//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require("dotenv").config();

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/UserDB")
  .then(() => console.log("Connected to mongoDB database!"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  bcrypt.hash(password, saltRounds, async function (err, hash) {
    const newUser = new User({
      email,
      password: hash,
    });

    try {
      await newUser.save();
      console.log("User created successfully");
      res.render("secrets");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating user");
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log("Invalid email or password!");
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          res.render("secrets");
        } else {
          console.log("Invalid email or password!");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
