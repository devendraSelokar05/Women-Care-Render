const express = require("express");
const {
    getAllProducts,
    getProductById,
} = require("../../controllers/branchAdmin-Controllers/branchAdminProductController");
const branchAdminAuthMiddleware = require("../../middlewares/branchAdminMiddleware");
const router = express.Router();
 
//✅ Branch Admin Product Routes
router.get("/getAllProducts", branchAdminAuthMiddleware, getAllProducts);
router.get("/getProductById/:id", branchAdminAuthMiddleware, getProductById);
 
 
module.exports = router;