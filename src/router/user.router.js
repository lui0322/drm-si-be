const express = require("express");
const user = express.Router();

const cors = require("cors");
user.use(cors());

//middleware
const auth = require("../middleware/auth.middleware");

//service
const userService = require("../service/user-service");
const roleService = require("../service/role-service");

user.get("/profile", auth, (req, res, next) => {
    userService.userProfile({req, res, next});
});

user.get("/role", auth, (req, res, next) => {
    roleService.rolesList({req, res, next});
});

module.exports = user;