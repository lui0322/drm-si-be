const express = require("express");
const users = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi")

const config = require("../config/config");
const User = require("../model/user.model");
users.use(cors());

process.env.SECRET_KEY = config.secret;

users.post("/auth", (req, res) => {
    User.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(user => {
            const schema = Joi.object().keys({
                username: Joi.string()
                    .trim()
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

            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                        expiresIn: '10h'
                    });

                    res.status(200).json({
                        status: "JWT Authentication success",
                        token: token
                    });
                } else {
                    res.status(401).json({
                        error: "Invalid username or password"
                    }); //user doesnt exist
                }
            } else {
                res.status(401).json({
                    error: "Invalid username or password"
                }); //authentication failed
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            }); //
        });
});

module.exports = users;