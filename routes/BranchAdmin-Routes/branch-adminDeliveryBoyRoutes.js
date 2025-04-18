const express = require("express");
const {
    getAllDeliveryBoys,
    getDeliveryBoyById,
    getOrderDetailsByDeliveryBoyId,
} = require("../../controllers/branchAdmin-Controllers/branchAdminDeliveryBoyController");
const router = express.Router();
 
//✅ Branch Admin Delivery Boy Routes
router.get("/getAllDeliveryBoys", getAllDeliveryBoys);
router.get("/getDeliveryBoyById/:id", getDeliveryBoyById);
router.get("/getOrderDetailsByDeliveryBoyId/:id", getOrderDetailsByDeliveryBoyId);

 
module.exports = router;