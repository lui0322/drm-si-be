const Sequelize = require("sequelize");
const db = require("../config/database");

module.exports = db.sequelize.define(
    "roles", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        role: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    }
);