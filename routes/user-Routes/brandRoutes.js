const express=require("express")
const router=express.Router()
const {upload} = require("../../config/cloudinary")
const {createBrand,getAllBrands, updateBrand, deleteBrand}=require("../../controllers/UserControllers/brandController")

//✅ User Brand Routes
router.post("/createBrand", upload.single("image"), createBrand);
router.get("/getAllBrands", getAllBrands);
router.put("/updateBrand/:id", upload.single("image"), updateBrand);
router.delete("/deleteBrand/:id", deleteBrand);

module.exports=router
