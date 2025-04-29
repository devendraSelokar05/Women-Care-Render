const express = require("express");
const router = express.Router();
const { getAboutUs, getPrivacyPolicy, getTermsAndConditions, getReferAndEarn } = require("../../controllers/UserControllers/userSettingsController");
 
//✅ User Settings Routes
router.get("/about-us", getAboutUs);
router.get("/privacy-policy", getPrivacyPolicy);
router.get("/terms-and-conditions", getTermsAndConditions);
router.get("/refer-and-earn", getReferAndEarn);
 
module.exports = router;
  