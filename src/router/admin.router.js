const express = require("express");
const admin = express.Router();

const cors = require("cors");
admin.use(cors());

//middleware
const auth = require("../middleware/auth.middleware");

//service
const roleService = require("../service/role-service");
const userService = require("../service/user-service");
const inventoryService = require("../service/inventory-service");
const productService = require("../service/product-service");
const storeService = require("../service/store-service");

//user-controller
admin.get("/profile", (req, res) => {
    userService.userProfile({req, res});
});

admin.get("/role", auth, (req, res, next) => {
    roleService.rolesList({req, res, next});
});

admin.post("/register", auth, (req, res) => {
    userService.userRegister({req, res});
});

admin.get("/accounts", auth, (req, res, next) => {
    userService.userList({req, res, next});
});

admin.get("/account/:id", auth, (req, res, next) => {
    userService.userById({req, res, next});
});

admin.put("/update_personal/:id", auth, (req, res) => {
    userService.userUpdatePersonal({req, res});
});

admin.put("/update_password/:id", auth, (req, res) => {
    userService.userUpdatePassword({req, res});
});

admin.put("/update_status/:id", auth, (req, res) => {
    userService.userUpdateStatus({req, res});
});

//store-controller
admin.get("/stores", auth, (req, res, next) => {
    storeService.storeList({req, res, next});
});

admin.get("/store/:id", auth, (req, res, next) => {
    storeService.storeById({req, res, next});
});

admin.put("/update_store/:id", auth, (req, res) => {
    storeService.storeUpdate({req, res});
});

//product-controller
admin.get("/products/list", auth, (req, res, next) => {
    productService.productList({req, res, next});
});

admin.get("/products", auth, (req, res, next) => {
    productService.productPages({req, res, next});
});

//inventory-controller
admin.get("/inventory/:id", auth, (req, res, next) => {
    inventoryService.inventoryStoreByIdPages({req, res, next});
});

admin.post("/inventory/add", (req, res, next) => {
    inventoryService.inventoryStoreByIdAdd({req, res, next});
});

admin.delete("/inventory_delete/:id", auth, (req, res) => {
    inventoryService.inventoryStoreByIdDelete({req, res});
});

module.exports = admin;