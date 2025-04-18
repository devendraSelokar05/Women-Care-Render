const express = require("express");
const router = express.Router();
const { submitContactUs } = require("../../controllers/UserControllers/ContactUsController");
 
 
 //✅ User Contact Us Routes
router.post("/contact-us", submitContactUs);
 
 
module.exports = router;