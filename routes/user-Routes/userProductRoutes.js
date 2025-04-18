const express = require("express");
const {
    getAllProducts,
    getProductById,
} = require("../../controllers/UserControllers/User-ProductController");
const router = express.Router();
 
//✅ User Product Routes
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
 
module.exports = router;