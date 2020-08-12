const Moment = require("moment-timezone");
const express = require("express");
const users = express.Router();
const cors = require("cors");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi")

const config = require("../config/config");
const auth = require("../middleware/authenticaion");
const User = require("../model/user.model");
const Role = require("../model/role.model");
users.use(cors());

process.env.SECRET_KEY = config.secret;

users.get("/profile", (req, res) => {
    return res.status(200).json({
        status: "JWT Authentication success"
    });
});

users.get("/role", auth, (req, res, next) => {
    Role.findAll({
            attributes: ["id", "role"]
        })
        .then(role => {
            res.status(200).json({
                data: role
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

users.get("/list", auth, (req, res, next) => {
    User.findAll({
            attributes: ["id", "username", "user_role", "created"]
        })
        .then(user => {
            res.status(200).json({
                data: user
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

users.post("/register", (req, res) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + config.utcHour);

    const userData = {
        name: req.body.name,
        user_role: req.body.user_role,
        username: req.body.username,
        password: req.body.password,
        created: today
    };

    User.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(user => {
            const schema = Joi.object().keys({
                name: Joi.string()
                    .min(2)
                    .max(45)
                    .required(),
                user_role: Joi.string()
                    .required(),
                username: Joi.string()
                    .min(2)
                    .max(45)
                    .required(),
                password: Joi.string()
                    .min(6)
                    .max(25)
                    .required()
            });

            const validate = schema.validate(req.body);
            if (validate.error) {
                return res.status(401).json({
                    error: validate.error.details[0].message
                });
            }

            if (!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    userData.password = hash;
                    User.create(userData)
                        .then(user => {
                            res.status(200).json({
                                status: user.username + " was successfully registered"
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                });
            } else {
                res.status(401).json({
                    error: user.username + " user already exists"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = users;