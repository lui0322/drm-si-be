const env = require("./env.config");
const Sequelize = require("sequelize");
const db = {};
const sequelize = new Sequelize(
    env.database,
    env.username,
    env.password, {
        host: env.host,
        dialect: env.dialect,
        host: env.host,
        dialect: env.dialect,

        pool: {
            max: env.pool.max,
            min: env.pool.min,
            acquire: env.pool.acquire,
            idle: env.pool.idle
        }
    }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;