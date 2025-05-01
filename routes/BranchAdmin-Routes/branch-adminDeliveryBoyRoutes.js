const express = require("express");
const {
    getAllDeliveryBoys,
    getDeliveryBoyById,
    getOrderDetailsByDeliveryBoyId,
} = require("../../controllers/branchAdmin-Controllers/branchAdminDeliveryBoyController");
const branchAdminAuthMiddleware = require("../../middlewares/branchAdminMiddleware");
const router = express.Router();
 
//✅ Branch Admin Delivery Boy Routes
router.get("/getAllDeliveryBoys",branchAdminAuthMiddleware,getAllDeliveryBoys);
router.get("/getDeliveryBoyById/:id",branchAdminAuthMiddleware, getDeliveryBoyById);
router.get("/getOrderDetailsByDeliveryBoyId/:id",branchAdminAuthMiddleware, getOrderDetailsByDeliveryBoyId);

 
module.exports = router;