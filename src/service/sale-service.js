'use strict'

const Sale = require("../model/sale.model");
const User = require("../model/user.model");
const Product = require("../model/product.model");
const Store = require("../model/store.model");
const Inventory = require("../model/inventory.model");
const util = require("../config/util.config");

const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const Moment = require("moment-timezone");
const inventoryModel = require("../model/inventory.model");

Sale.belongsTo(User, { foreignKey: "user_id"});
User.belongsTo(Sale, { foreignKey: "id" });

Sale.belongsTo(Product, { foreignKey: "product_id"});
Product.belongsTo(Sale, { foreignKey: "id" });

Sale.belongsTo(Store, { foreignKey: "store_id" });
Store.belongsTo(Sale, { foreignKey: "id" });

const saleByUserIdPending = ({req, res, next}) => {
    const userId = req.params.id;

    const schema = Joi.object().keys({
        user_id: Joi.number()
    });

    const validate = schema.validate(req.body);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Sale.findAndCountAll({
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
        attributes: ["id", "tran_id", "user_id", "store_id", "product_id", "stock", "amount", "status", "created"],
        where: {
            user_id: userId,
            status: 'Pending'
        },
        order: [["id", "ASC"]]
    })
    .then(sale => {
        res.status(200).json({
            data: sale
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

const saleByUserIdCreate = ({req, res, next}) => {
    let today = new Date();
    today = today.setUTCHours(today.getUTCHours() + util.utcHour);
    const tranId = Moment.tz(new Date(), "Asia/Manila").format("YYYYMMDDHHmmss")

    let saleData = {
        tran_id: tranId,
        user_id: req.body.user_id,
        store_id: req.body.store_id,
        product_id: req.body.product_id,
        stock: req.body.stock,
        amount: req.body.amount,
        status: 'Pending',
        created: today
    };

    const schema = Joi.object().keys({
        user_id: Joi.number()
            .required(),
        store_id: Joi.number()
            .required(),
        product_id: Joi.number()
            .required(),
        stock: Joi.number()
            .min(1)
            .required(),
        amount: Joi.number()
            .min(1)
            .required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }
    
    Inventory.findOne({
        where: {
            store_id: saleData.store_id,
            product_id: saleData.product_id
        }
    })
    .then(inventory => {
        if(inventory) {
            Sale.findOne({
                where: {
                    [Op.and]: [
                        {
                            user_id: {
                                [Op.eq]: saleData.user_id
                            }
                        },
                        {
                            store_id: {
                                [Op.eq]: saleData.store_id
                            }
                        },
                        {
                            status: {
                                [Op.eq]: 'Pending'
                            }
                        }
                    ]
                },
                order: [["id", "ASC"]]
            })
            .then(sale => {
                if(sale) {
                    console.log(sale.tran_id);
                    saleData.tran_id = sale.tran_id;
                }

                Sale.create(saleData)
                .then(() => {
                    let updatedStock = parseFloat(inventory.stock) - parseFloat(saleData.stock);

                    Inventory.update({stock: updatedStock}, {
                        where: {
                            store_id: saleData.store_id,
                            product_id: saleData.product_id
                        }
                    })
                    .then(() => {
                        res.status(200).json({
                            status: "Product was successfully added in POS"
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
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
            
        } else {
            res.status(401).json({
                error: "Inventory record not found"
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

const saleByUserIdDelete = ({req, res, next}) => {
    const saleId = req.params.id;
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

    Sale.findOne({
        where: {
            id: saleId
        }
    })
    .then(sale => {
        if (sale) {
            Inventory.findOne({
                where: {
                    store_id: sale.store_id,
                    product_id: sale.product_id
                }
            })
            .then(inventory => {
                if(inventory) {
                    Sale.destroy({
                        where: {
                            id: saleId
                        }
                    })
                    .then(() => {
                        let updatedStock = parseFloat(inventory.stock) + parseFloat(sale.stock);
                        Inventory.update({stock: updatedStock}, {
                            where: {
                                store_id: sale.store_id,
                                product_id: sale.product_id
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
                        
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                } else {
                    res.status(401).json({
                        error: "Inventory record not found"
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
                error: "Product in POS record not found"
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

const saleByUserIdUpdate = ({req, res, next}) => {
    const userId = req.params.user_id;
    const storeId = req.params.store_id;
    const tranId = req.params.tran_id;
    const status = req.params.status;
    const schema = Joi.object().keys({
        user_id: Joi.number()
            .required(),
        store_id: Joi.number()
            .required(),
        tran_id: Joi.number()
            .required(),
        status: Joi.string()
            .required()
    });

    const validate = schema.validate(req.params);
    if (validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Sale.findOne({
        where: {
            user_id: userId,
            store_id: storeId,
            tran_id: tranId
        },
        order: [["id", "ASC"]]
    })
    .then(sale => {
        if(sale) {
            Sale.update({status: status}, {
                where: {
                    user_id: userId,
                    store_id: storeId,
                    tran_id: tranId
                }
            })
            .then(() => {
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
        } else {
            res.status(401).json({
                error: "Sale record not found"
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

const saleStoreByIdPages = ({req, res, next}) => {
    const store_id = req.params.store_id;
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

    const validate = schema.validate(req.query);

    if(validate.error) {
        return res.status(401).json({
            error: validate.error.details[0].message
        });
    }

    Sale.findAndCountAll({
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
        attributes: ["id", "tran_id", "store_id", "product_id", "stock", "amount", "status", "created"],
        where: {
            store_id: store_id
        },
        offset: startIndex,
        limit: endIndex,
        order: [["id", "DESC"]]
    })
    .then(sale => {
        res.status(200).json({
            data: sale
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

module.exports.saleByUserIdPending = saleByUserIdPending;
module.exports.saleByUserIdCreate = saleByUserIdCreate;
module.exports.saleByUserIdDelete = saleByUserIdDelete;
module.exports.saleByUserIdUpdate = saleByUserIdUpdate;
module.exports.saleStoreByIdPages = saleStoreByIdPages;