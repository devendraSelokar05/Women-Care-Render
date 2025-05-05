const express = require("express");
const router = express.Router();

const { getAllOrders, getOrderById } = require("../../controllers/SuperAdmin-Controllers/superAdmin-OrderController");

//✅ SuperAdmin Order Routes
router.get("/getAllOrders", getAllOrders);
router.get("/getOrderById/:id", getOrderById);
module.exports = router;
