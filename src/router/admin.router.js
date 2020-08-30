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
const deliveryService = require("../service/delivery-service");

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
admin.get("/product/:id", auth, (req, res, next) => {
    productService.productById({req, res, next});
});

admin.post("/product/create", auth, (req, res, next) => {
    productService.productCreate({req, res, next});
});

admin.put("/product_update/:id", auth, (req, res, next) => {
    productService.productUpdate({req, res, next});
});

admin.delete("/product_delete/:id", auth, (req, res, next) => {
    productService.productDelete({req, res, next});
});

admin.get("/products/list", auth, (req, res, next) => {
    productService.productList({req, res, next});
});

admin.get("/products", auth, (req, res, next) => {
    productService.productPages({req, res, next});
});

//inventory-controller
admin.get("/inventory_product/:id", auth, (req, res, next) => {
    inventoryService.inventoryProductById({req, res, next});
});

admin.get("/inventory/:id", auth, (req, res, next) => {
    inventoryService.inventoryStoreByIdPages({req, res, next});
});

admin.post("/inventory/add", (req, res, next) => {
    inventoryService.inventoryStoreByIdAdd({req, res, next});
});

admin.put("/inventory_update/:id", auth, (req, res) => {
    inventoryService.inventoryStoreByIdUpdate({req, res});
});

admin.delete("/inventory_delete/:id/:product_id", auth, (req, res) => {
    inventoryService.inventoryStoreByIdDelete({req, res});
});

//delivery-controller
admin.get("/delivery_product/:id", auth, (req, res, next) => {
    deliveryService.deliveryProductById({req, res, next});
});

admin.get("/delivery/:id", auth, (req, res, next) => {
    deliveryService.deliveryStoreByIdPages({req, res, next});
});

admin.get("/delivery_productpages/:id", auth, (req, res, next) => {
    deliveryService.deliveryProductByIdPages({req, res, next});
});

admin.post("/delivery/add", (req, res, next) => {
    deliveryService.deliveryStoreByIdAdd({req, res, next});    
});

admin.delete("/delivery_delete/:id", auth, (req, res) => {
    deliveryService.deliveryStoreByIdDelete({req, res});
});

module.exports = admin;