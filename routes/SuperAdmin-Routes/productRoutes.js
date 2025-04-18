const express = require("express");
const { upload } = require("../../config/cloudinary");
const {
    getAllProducts,
    getProductById,
    deleteProductById,
    createProduct,
    updateProduct,
    getBrands,
    getSizes,
    addProductQuantity,
    removeProductQuantity,
    getAvailableProductQuantity,
    getAllBranches,
    assignToBranch,
    getBranchProductQuantity,
} = require("../../controllers/SuperAdmin-Controllers/productController");
const router = express.Router();
 
//✅ SuperAdmin Product Routes
router.post("/createProduct", upload.array("image", 5), createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.get("/getAvailableProductQuantity/:id", getAvailableProductQuantity);
router.get("/getBranchDropdown", getAllBranches);
router.put("/assignProductToBranch", assignToBranch);
router.get("/getAvailableQuantityOfProduct", getBranchProductQuantity);
router.put("/updateProduct/:id", upload.array("image", 5), updateProduct);
router.delete("/deleteProductById/:id", deleteProductById);
router.get("/getAllBrands", getBrands);
router.get("/getAllSizes", getSizes);
router.put("/addProductQuantity/:id", addProductQuantity);
router.put("/removeProductQuantity/:id", removeProductQuantity);
 
module.exports = router;
