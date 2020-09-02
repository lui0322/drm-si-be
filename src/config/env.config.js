const env = {
    database: 'rest_db',
    username: 'user_root',
    password: 'Passw0rd01!',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

module.exports = env;