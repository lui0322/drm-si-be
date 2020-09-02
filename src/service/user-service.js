'use strict'

const User = require("../model/user.model");
const Role = require("../model/role.model");
const Store = require("../model/store.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const util = require("../config/util.config");

process.env.SECRET_KEY = util.secret;

const userList = ({req, res, next}) => {
    User.findAll({
        attributes: ["id", "name", "username", "user_role", "created"]
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
};

User.belongsTo(Store, { foreignKey: "store_id" });
Store.belongsTo(User, { foreignKey: "id" });

User.belongsTo(Role, { foreignKey: "user_role" });
Role.belongsTo(User, { foreignKey: "id" });

const userById = ({req, res, next}) => {
    const userId = req.params.id;
    User.findOne({
        include: [
            {
                model: Role,
                attributes: ["role"]
            },
            {
                model: Store,
                attributes: ["name"]
            }
        ],
        attributes: ["id", "name", "address", "mobile", "username", "user_role", "store_id", "status", "created"],
        where: {
            id: userId
        }
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
};

const userProfile = ({req, res, next}) => {
    return res.status(200).json({
        status: "JWT Authentication success"
    });
};

const userRegister = ({req, res, next}) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + config.utcHour);

    const userData = {
        name: req.body.name,
        user_role: req.body.user_role,
        username: req.body.username,
        password: req.body.password,
        created: today
    };

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

    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(user => {
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
};

const userLogin = ({req, res}) => {
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
    
    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(user => {
        console.log("user: ", user.status);
        if (user.status === "Inactive") {
            return res.status(401).json({
                error: "Account is already inactive"
            }); //user doesnt exist
        }

        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: '12h'
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
};

const userUpdatePersonal = ({req, res, next}) => {
    const userId = req.params.id;
    const userData = {
        name: req.body.name,
        address: req.body.address,
        mobile: req.body.mobile
    };

    const schema = Joi.object().keys({
        name: Joi.string()
            .min(2)
            .max(100)
            .required(),
        address: Joi.string()
            .min(2)
            .max(100)
            .required(),
        mobile: Joi.string()
            .min(2)
            .max(100)
            .required(),
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    User.update(userData, {
        where: {
            id: userId
        }
    })
    .then(user => {
        res.status(200).json({
            status: "Update successful!"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const userUpdatePassword = ({req, res, next}) => {
    const userId = req.params.id;
    const userData = {
        password: req.body.password
    };

    const schema = Joi.object().keys({
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
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        userData.password = hash;
        User.update(userData, {
            where: {
                id: userId
            }
        })
        .then(user => {
            res.status(200).json({
                status: "Update successful!"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    });
};

const userUpdateStatus = ({req, res, next}) => {
    const userId = req.params.id;

    const userData = {
        status: req.body.status,
        store_id: req.body.store_id
    };

    const schema = Joi.object().keys({
        status: Joi.string()
            .required(),
        store_id: Joi.number()
            .required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    User.update(userData, {
        where: {
            id: userId
        }
    })
    .then(user => {
        res.status(200).json({
            status: "Update successful!"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

module.exports.userList = userList;
module.exports.userById = userById
module.exports.userProfile = userProfile;
module.exports.userRegister = userRegister;
module.exports.userLogin = userLogin;

module.exports.userUpdatePersonal = userUpdatePersonal;
module.exports.userUpdatePassword = userUpdatePassword;
module.exports.userUpdateStatus = userUpdateStatus;