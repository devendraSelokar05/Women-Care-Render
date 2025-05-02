const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/SuperAdmin-Controllers/settingsController");
const { upload } = require("../../config/cloudinary");
 
// Emergency Fee
router.post("/createEmergencyFee", ctrl.createEmergencyFee);
router.get("/getEmergencyFee", ctrl.getEmergencyFee);
router.put("/updateEmergencyFee", ctrl.updateEmergencyFee);
 
// Terms
router.post("/createTerms", ctrl.createTerms);
router.get("/getTerms", ctrl.getTerms);
router.put("/updateTerms", ctrl.updateTerms);
 
// Privacy
router.post("/createPrivacy", ctrl.createPrivacy);
router.get("/getPrivacy", ctrl.getPrivacy);
router.put("/updatePrivacy", ctrl.updatePrivacy);
 
// About Us
router.post("/createAboutUs", upload.array("image", 5), ctrl.createAboutUs);
router.get("/getAboutUs", ctrl.getAboutUs);
router.put("/updateAboutUs", upload.array("image", 5), ctrl.updateAboutUs);
 
module.exports = router;