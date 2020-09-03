const express = require("express");
const user = express.Router();

const cors = require("cors");
user.use(cors());

//middleware
const auth = require("../middleware/auth.middleware");

//service
const userService = require("../service/user-service");
const roleService = require("../service/role-service");
const productService = require("../service/product-service");
const inventoryService = require("../service/inventory-service");
const saleService = require("../service/sale-service");


//user-controller
user.get("/profile", auth, (req, res, next) => {
    userService.userProfile({req, res, next});
});

user.get("/userprofile/:id", auth, (req, res, next) => {
    userService.userById({req, res, next});
});

//role-controller
user.get("/role", auth, (req, res, next) => {
    roleService.rolesList({req, res, next});
});

//product-controller
user.get("/products/list", auth, (req, res, next) => {
    productService.productList({req, res, next});
});

//inventory-controller
user.get("/inventory/:id", auth, (req, res, next) => {
    inventoryService.inventoryStoreByIdPages({req, res, next});
});

//sale-controller
user.get("/salestorebyid/:store_id", auth, (req, res, next) => {
    saleService.saleStoreByIdPages({req, res, next});
});

user.get("/salebyuseridpending/:id", auth, (req, res, next) => {
    saleService.saleByUserIdPending({req, res, next});
});

user.post("/salebyuseridcreate/add", auth, (req, res, next) => {
    saleService.saleByUserIdCreate({req, res, next});
});

user.delete("/salebyuseriddelete/:id", auth, (req, res, next) => {
    saleService.saleByUserIdDelete({req, res, next});
});

user.put("/salebyuseridupdate/:user_id/:store_id/:tran_id/:status", auth, (req, res, next) => {
    saleService.saleByUserIdUpdate({req, res, next});
});

module.exports = user;