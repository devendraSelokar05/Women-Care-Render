const express = require("express");
const router = express.Router();
const { upload } = require("../../config/cloudinary");
 const {addBanner, getAllBanners, getBannerById, updateBanner, deleteBanner} = require("../../controllers/SuperAdmin-Controllers/bannerController");

 //✅ SuperAdmin Banner Routes
router.post("/addBanner", upload.single("image"), addBanner);
router.get("/getAllBanner", getAllBanners);
router.get("/getBannerById/:id", getBannerById);
router.put("/updateBanner/:id", upload.single("image"), updateBanner);
router.delete("/deleteBanner/:id", deleteBanner);


module.exports = router;