const express = require("express");
const router = express.Router();

const { getAllBranchOrders, getOrderBranchDetails, getOrderStatus, getDeliveryBoyDropdown, assignDelivery } = require("../../controllers/branchAdmin-Controllers/branchOrderController");
const branchAdminAuthMiddleware = require("../../middlewares/branchAdminMiddleware");


//✅ Order Routes
router.get("/all-branch-orders",branchAdminAuthMiddleware, getAllBranchOrders);
router.get("/branch-order-details/:id", getOrderBranchDetails);
router.get("/order-status", getOrderStatus);
router.put("/assignDelivery/:id", assignDelivery);
router.get("/DeliveryBoyDropdown", getDeliveryBoyDropdown);

module.exports = router;