const express = require("express");
const router = express.Router();
const {getTopSellingBrands, getRecentOrders,getProductCount,getAllOrdersDeliveredIncome,getAllDelieveryBoys,getAllOrders} = require("../../controllers/branchAdmin-Controllers/branchAdminDashboardController");
 


//✅ Branch Admin Dashboard Routes
router.get("/deliveryBoyCount", getAllDelieveryBoys);
router.get("/totalOrderCount", getAllOrders);
router.get("/delivered-income", getAllOrdersDeliveredIncome);
router.get('/totalProductCount', getProductCount);
router.get("/top-brands", getTopSellingBrands);
router.get("/recent-orders", getRecentOrders);

 


 
module.exports = router;