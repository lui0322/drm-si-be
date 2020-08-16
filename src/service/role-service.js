'use strict'

const Role = require("../model/role.model");

const rolesList = ({res, req, next}) => {
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
};

module.exports.rolesList = rolesList;