const express = require("express");
const login = express.Router();

const cors = require("cors");
login.use(cors());

//service
const userService = require("../service/user-service");

login.post("/auth", (req, res) => {
    userService.userLogin({req, res});
});

module.exports = login;