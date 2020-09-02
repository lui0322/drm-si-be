'use strict'

const Product = require("../model/product.model");
const Inventory = require("../model/inventory.model");
const util = require("../config/util.config");

const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const inventoryModel = require("../model/inventory.model");
const Op = Sequelize.Op;


const productById = ({req, res, next}) => {
    const productId = req.params.id;  
    Product.findOne({
        attributes: ["id", "name", "price", "description", "created"],
        where: {
            id: productId
        }
    })
    .then(product => {
        res.status(200).json({
            data: product
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const productCreate = ({req, res, next}) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + util.utcHour);

    const productData = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        created: today
    };

    const schema = Joi.object().keys({
        name: Joi.string()
            .min(2)
            .max(100)
            .required(),
        price: Joi.number()
            .min(1)
            .required(),
        description: Joi.string()
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

    Product.findOne({
        where: {
            name: req.body.name
        }
    })
    .then(product => {
        if(!product) {
            Product.create(productData)
            .then(product => {
                res.status(200).json({
                    status: "Product was successfully added"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(401).json({
                error: "Product was already existed!"
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

const productUpdate = ({req, res, next}) => {
    const productId = req.params.id;
    const productData = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    };

    const schema = Joi.object().keys({
        name: Joi.string()
            .min(2)
            .max(100)
            .required(),
        price: Joi.number()
            .min(1)
            .required(),
        description: Joi.string()
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

    Product.update(productData, {
        where: {
            id: productId
        }
    })
    .then(product => {
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

const productDelete = ({req, res, next}) => {
    const productId = req.params.id;
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

    //if existed in Inventory table
    Inventory.findOne({
        where: {
            product_id: productId
        }
    })
    .then(inventory => {
        if (!inventory) {
            Product.findOne({
                where: {
                    id: productId
                }
            })
            .then(product => {
                if(product) {
                    Product.destroy({
                        where: {
                            id: productId
                        }
                    })
                    .then(product => {
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
                } else {
                    res.status(401).json({
                        error: "Record not found!"
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(401).json({
                error: "Product was already existed in Store"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        }, () => {
            return;
        });
    });

    
};

const productList = ({req, res, next}) => {
    Product.findAll({
        attributes: ["id", "name", "price", "description", "created"],
        order: [["id", "ASC"]]
    })
    .then(product => {
        res.status(200).json({
            data: product
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const productPages = ({req, res, next}) => {
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
        attributes: ["id", "name", "price", "description", "created"],
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
};

module.exports.productById = productById;
module.exports.productCreate = productCreate;
module.exports.productUpdate = productUpdate;
module.exports.productDelete = productDelete;
module.exports.productList = productList;
module.exports.productPages = productPages;