'use strict'

const Inventory = require("../model/inventory.model");
const Product = require("../model/product.model");
const Store = require("../model/store.model");

const util = require("../config/util.config");
const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

Inventory.belongsTo(Product, { foreignKey: "product_id" });
Product.belongsTo(Inventory, { foreignKey: "id" });

Inventory.belongsTo(Store, { foreignKey: "store_id" });
Store.belongsTo(Inventory, { foreignKey: "id" });

const inventoryStoreByIdPages = ({req, res, next}) => {
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
};

const inventoryStoreByIdAdd = ({req, res, next}) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + util.utcHour);

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
};

const inventoryStoreByIdDelete = ({req, res, next}) => {
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
};

module.exports.inventoryStoreByIdPages = inventoryStoreByIdPages;
module.exports.inventoryStoreByIdAdd = inventoryStoreByIdAdd;
module.exports.inventoryStoreByIdDelete = inventoryStoreByIdDelete;