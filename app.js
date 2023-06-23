//jshint esversion:6
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
 
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://0.0.0.0:27017/userDB", {useNewUrlParser: true});

const userSchema= new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login", {errMsg: "", username: "", password: ""});
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });  

    try {
        const savedUser = await newUser.save();
        res.render("secrets");
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then(function (foundUser) {
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            }else {
                res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
            }
        }else {
            res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
        }
    }
        ).catch(function (err) {
            console.log(err);
        })   
    });

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

  