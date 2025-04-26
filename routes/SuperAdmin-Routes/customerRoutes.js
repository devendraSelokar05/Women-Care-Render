 
const express = require("express");
const { upload } = require("../../config/cloudinary");
const {
    getAllCustomers,
    updateCustomer,
    getCustomerById,
    deleteCustomer,
    getAllGenders,
} = require("../../controllers/SuperAdmin-Controllers/customerController");
 
const router = express.Router();

 //✅ SuperAdmin Customer Routes
router.get("/getAllCustomers", getAllCustomers);
router.get("/getCustomer/:userId", getCustomerById);
router.put("/updateCustomer/:userId", upload.single("image"), updateCustomer);
router.delete("/deleteCustomer/:userId", deleteCustomer);
router.get("/getAllGenders", getAllGenders);
 
module.exports = router;