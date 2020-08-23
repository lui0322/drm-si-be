'use strict'

const Store = require("../model/store.model");
const Joi = require("@hapi/joi");

const storeList = ({req, res, next}) => {
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
};

const storeById = ({req, res, next}) => {
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
};

const storeUpdate = ({req, res, next}) => {
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
};

module.exports.storeList = storeList;
module.exports.storeById = storeById;

module.exports.storeUpdate = storeUpdate;