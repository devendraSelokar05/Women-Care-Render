const express = require("express");
const {LoginDeliveryBoy, getDeliveryBoyProfile, updateProfile} =  require("../../controllers/deliveryBoy-Controllers/deliveryBoyAuthController")
const deliveryBoyAuthMiddleware =  require("../../middlewares/deliveryBoyAuthMiddleware")
const { upload } = require("../../config/cloudinary");
const router = express.Router();
 
//✅ Delivery Boy Model Routes
router.post("/login", LoginDeliveryBoy);
router.get("/getProfile", deliveryBoyAuthMiddleware, getDeliveryBoyProfile);
router.put("/updateProfile", deliveryBoyAuthMiddleware, upload.fields([
    { name: "image", maxCount: 1 },
]), updateProfile);
 
module.exports = router;