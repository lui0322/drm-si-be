const Sequelize = require("sequelize");
const db = require("../config/db.config");

module.exports = db.sequelize.define(
    "deliverys", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        store_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        product_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        delivery: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        remarks: {
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