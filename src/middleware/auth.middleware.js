const jwt = require("jsonwebtoken");
const Role = require("../model/role.model");
const util = require("../config/util.config");

process.env.SECRET_KEY = util.secret;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const userType = req.originalUrl.split("/")[2];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userData = decoded;

        Role.findOne({
                attributes: ["role"],
                where: {
                    id: decoded.user_role
                }
            })
            .then(role => {
                const getType = userType.toLowerCase();
                const getRole = role.dataValues.role;

                if (getType === getRole.toLowerCase()) {
                    next();
                } else {
                    return res.status(401).json({
                        jwt: "JWT Authentication failed"
                    });
                }
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            jwt: "JWT Authentication failed"
        });
    }
};