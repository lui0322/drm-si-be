const Sequelize = require("sequelize");
const db = require("../config/db.config");

module.exports = db.sequelize.define(
    "products", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        created: {
            type: Sequelize.DATE,
            allowNull: false
        }
    }, {
        timestamps: false
    }
);