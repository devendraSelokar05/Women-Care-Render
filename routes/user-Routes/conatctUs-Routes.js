const express = require("express");
const router = express.Router();
const { createContactUs, getContactUs } = require("../../controllers/UserControllers/ContactUsController");
 
 
 //✅ User Contact Us Routes
router.post("/createContactUs", createContactUs);
router.get("/getContactUs", getContactUs);
 
module.exports = router;