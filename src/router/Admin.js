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
const Store = require("../model/store.model");
const Product = require("../model/product.model");
const Inventory = require("../model/inventory.model");
users.use(cors());

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

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

users.get("/accounts", auth, (req, res, next) => {
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
});

users.get("/account/:id", auth, (req, res, next) => {
    User.findOne({
        attributes: ["id", "name", "address", "mobile", "username", "user_role", "store_id", "status", "created"],
        where: {
            id: req.params.id
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
});

users.get("/stores", auth, (req, res, next) => {
    Store.findAll({
        attributes: ["id", "name", "address", "created"]
    })
    .then(store => {
        res.status(200).json({
            data: store
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

users.get("/store/:id", auth, (req, res, next) => {
    const storeId = req.params.id;
    Store.findOne({
        attributes: ["id", "name", "address", "created"],
        where: {
            id: storeId
        }
    })
    .then(store => {
        res.status(200).json({
            data: store
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

users.get("/products/list", auth, (req, res) => {
    Product.findAll({
        attributes: ["id", "name", "description", "created"],
        order: [["id", "ASC"]]
    })
    .then(store => {
        res.status(200).json({
            data: store
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

users.get("/products", auth, (req, res, next) => {
    const search = req.query.search;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = limit;

    const schema = Joi.object().keys({
        search: Joi.string().allow("", null),
        page: Joi.number(),
        limit: Joi.number()
    });

    const validate = schema.validate(req.body);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Product.findAndCountAll({
        attributes: ["id", "name", "description", "created"],
        offset: startIndex,
        limit: endIndex,
        where: {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    description: {
                        [Op.like]: `%${search}%`
                    }
                }
            ]
        },
        order: [["id", "DESC"]]
    })
    .then(store => {
        res.status(200).json({
            data: store
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

Inventory.belongsTo(Product, { foreignKey: "product_id" });
Product.belongsTo(Inventory, { foreignKey: "id" });

Inventory.belongsTo(Store, { foreignKey: "store_id" });
Store.belongsTo(Inventory, { foreignKey: "id" });

users.get("/inventory/:id", auth, (req, res, next) => {
    const store_id = req.params.id;
    const search = req.query.search;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = limit;

    const schema = Joi.object().keys({
        store_id: Joi.number(),
        search: Joi.string().allow("", null),
        page: Joi.number(),
        limit: Joi.number()
    });

    const validate = schema.validate(req.body);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Inventory.findAndCountAll({
        include: [
            {
              model: Product,
              attributes: ["name", "description"],
              where: {
                  name: {
                      [Op.like]: `%${search}%`
                  }
              }
            },
            {
                model: Store,
                attributes: ["name"]
            }
        ],
        attributes: ["id", "store_id", "product_id", "stock", "created"],
        where: {
            store_id: store_id
        },
        offset: startIndex,
        limit: endIndex,
        order: [["id", "DESC"]]
    })
    .then(inventory => {
        res.status(200).json({
            data: inventory
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

users.post("/inventory/add", (req, res, next) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + config.utcHour);

    const inventoryData = {
        store_id: req.body.store_id,
        product_id: req.body.product_id,
        stock: req.body.stock,
        created: today
    };

    const schema = Joi.object().keys({
        store_id: Joi.number()
            .required(),
        product_id: Joi.number()
            .required(),
        stock: Joi.number()
            .min(1)
            .required()
    });

    const validate = schema.validate(req.body);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }
    
    Inventory.findOne({
        include: [
            {
                model: Product,
                attributes: ["name", "description"],
                where: {
                    id: inventoryData.product_id
                }
            },
            {
                model: Store,
                attributes: ["name"]
            }
        ],
        where: {
            [Op.and]: [
                {
                    store_id: {
                        [Op.eq]: inventoryData.store_id
                    }
                },
                {
                    product_id: {
                        [Op.eq]: inventoryData.product_id
                    }
                },
                
            ]
        }
    })
    .then(inventory => {
        if (!inventory) {
            Inventory.create(inventoryData)
            .then(inventory => {
                res.status(200).json({
                    status: "Product inventory was successfully added"
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(401).json({
                error: inventory.product.name + "(" + inventory.product_id + ") already exists in store " + inventory.store.name 
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

users.delete("/inventory_delete/:id", auth, (req, res) => {
    const deleteId = req.params.id;
    const schema = Joi.object().keys({
        id: Joi.number()
            .required()
    });

    const validate = schema.validate(req.params);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Inventory.destroy({
        where: {
            id: deleteId
        }
    })
    .then(inventory => {
        res.status(200).json({
            status: "Delete successful!"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

users.put("/update_personal/:id", auth, (req, res) => {
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
});

users.put("/update_password/:id", auth, (req, res) => {
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
});

users.put("/update_status/:id", auth, (req, res) => {
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
});

users.put("/update_store/:id", auth, (req, res) => {
    const storeId = req.params.id;
    const storeData = {
        name: req.body.name,
        address: req.body.address
    };

    const schema = Joi.object().keys({
        name: Joi.string()
            .min(2)
            .max(100)
            .required(),
        address: Joi.string()
            .min(2)
            .max(100)
            .required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Store.update(storeData, {
        where: {
            id: storeId
        }
    })
    .then(store => {
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