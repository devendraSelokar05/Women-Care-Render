const express = require("express");
const router = express.Router();
const { createSettings, updateEmergencyDeliveryFeeAndSettingType, getSettings, editTermsAndConditions, editPrivacyPolicy, updateAboutUs, updateReferAndEarn, settingTypeDropdown } = require("../../controllers/SuperAdmin-Controllers/settingsController");
const { upload } = require("../../config/cloudinary");
 
//✅ SuperAdmin Setting Routes
router.post(
  "/AddSettings",
  upload.fields([
    { name: "aboutUsImages", maxCount: 5 },
    { name: "referAndEarnImages", maxCount: 5 },
  ]),
  createSettings
);
router.put("/updateSettings", updateEmergencyDeliveryFeeAndSettingType);
router.get("/getAllSettings", getSettings);
 
router.put("/terms", editTermsAndConditions);
router.put("/privacy", editPrivacyPolicy);
router.put(
  "/about-us",
  upload.array("images", 5),
  updateAboutUs
);
router.put(
  "/refer-and-earn",
  upload.array("images", 5),
  updateReferAndEarn
);

router.get("/settingDropdown", settingTypeDropdown);
 
module.exports = router;
 