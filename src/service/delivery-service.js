'use strict'

const Inventory = require("../model/inventory.model");
const Delivery = require("../model/delivery.model");
const Product = require("../model/product.model");
const Store = require("../model/store.model");

const util = require("../config/util.config");
const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const { DOUBLE } = require("sequelize");
const Op = Sequelize.Op;

Delivery.belongsTo(Product, { foreignKey: "product_id" });
Product.belongsTo(Delivery, { foreignKey: "id" });

Delivery.belongsTo(Store, { foreignKey: "store_id" });
Store.belongsTo(Delivery, { foreignKey: "id" });

const deliveryProductById = ({req, res, next}) => {
    const product_id = req.params.id;

    const schema = Joi.object().keys({
        product_id: Joi.number()
    });

    const validate = schema.validate(req.body);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Delivery.findAndCountAll({
        include: [
            {
              model: Product,
              attributes: ["name", "price", "description"],
            },
            {
                model: Store,
                attributes: ["name"]
            }
        ],
        attributes: ["id", "store_id", "product_id", "delivery", "created"],
        where: {
            product_id: product_id
        },
        order: [["id", "DESC"]]
    })
    .then(delivery => {
        res.status(200).json({
            data: delivery
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const deliveryProductByIdPages = ({req, res, next}) => {
    const product_id = req.params.id;
    const search = req.query.search;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = limit;

    const schema = Joi.object().keys({
        product_id: Joi.number(),
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

    Delivery.findAndCountAll({
        include: [
            {
              model: Product,
              attributes: ["name", "price", "description"],
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
        attributes: ["id", "store_id", "product_id", "delivery", "created"],
        where: {
            product_id: product_id
        },
        offset: startIndex,
        limit: endIndex,
        order: [["id", "DESC"]]
    })
    .then(delivery => {
        res.status(200).json({
            data: delivery
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const deliveryStoreByIdPages = ({req, res, next}) => {
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

    Delivery.findAndCountAll({
        include: [
            {
              model: Product,
              attributes: ["name", "price", "description"],
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
        attributes: ["id", "store_id", "product_id", "delivery", "created"],
        where: {
            store_id: store_id
        },
        offset: startIndex,
        limit: endIndex,
        order: [["id", "DESC"]]
    })
    .then(delivery => {
        res.status(200).json({
            data: delivery
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const deliveryStoreByIdAdd = ({req, res, next}) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + util.utcHour);

    const deliveryData = {
        store_id: req.body.store_id,
        product_id: req.body.product_id,
        delivery: req.body.delivery,
        remarks: req.body.remarks,
        created: today
    };

    const schema = Joi.object().keys({
        store_id: Joi.number()
            .required(),
        product_id: Joi.number()
            .required(),
        delivery: Joi.number()
            .min(1)
            .required(),
        remarks: Joi.string()
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
        where: {
            store_id: deliveryData.store_id,
            product_id: deliveryData.product_id,
        }
    })
    .then(inventory => {
        if(inventory) {
            var updatedStock = parseFloat(inventory.stock) + parseFloat(deliveryData.delivery)
            Delivery.create(deliveryData)
            .then(delivery => {
                if (delivery) {
                    Inventory.update({stock: updatedStock}, {
                        where: {
                            store_id: deliveryData.store_id,
                            product_id: deliveryData.product_id
                        }
                    })
                    .then(inventory => {
                        res.status(200).json({
                            status: "Product Delivery was successfully added"
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
                        error: "Product Delivery was not created"
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
                error: "Inventory record not found!"
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

const deliveryStoreByIdDelete = ({req, res, next}) => {
    const deliveryId = req.params.id;
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

    Delivery.findOne({
        where: {
            id: deliveryId
        }
    })
    .then(delivery => {
        if(delivery) {
            Delivery.destroy({
                where: {
                    id: deliveryId
                }
            })
            .then(delivery => {
                res.status(200).json({
                    status: "Delete successful!"
                });
            })
            .then(() => {
                Inventory.findOne({
                    where: {
                        store_id: delivery.store_id,
                        product_id: delivery.product_id,
                    }
                })
                .then(inventory => {
                    let updatedStock = parseFloat(inventory.stock) - parseFloat(delivery.delivery);
                    Inventory.update({stock: updatedStock}, {
                        where: {
                            store_id: inventory.store_id,
                            product_id: inventory.product_id
                        }
                    })
                    .then()
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
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
};

module.exports.deliveryProductById = deliveryProductById;
module.exports.deliveryProductByIdPages = deliveryProductByIdPages;
module.exports.deliveryStoreByIdPages = deliveryStoreByIdPages;
module.exports.deliveryStoreByIdAdd = deliveryStoreByIdAdd;
module.exports.deliveryStoreByIdDelete = deliveryStoreByIdDelete;