const express = require("express");
const {
    getAllProducts,
    getProductById,
    getBuyItWith,
    getRelatedProducts,
} = require("../../controllers/UserControllers/User-ProductController");
const router = express.Router();

//✅ User Product Routes
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.get("/getBuyItWith/:productId", getBuyItWith);
router.get("/getRelatedProducts/:productId", getRelatedProducts);

module.exports = router;