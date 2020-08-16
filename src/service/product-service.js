'use strict'

const Product = require("../model/product.model");

const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const productList = ({req, res, next}) => {
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
};

module.exports.productList = productList;
module.exports.productPages = productPages;