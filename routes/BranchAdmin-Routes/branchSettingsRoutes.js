const express = require("express");
const { getSettings } = require("../../controllers/branchAdmin-Controllers/branchSettingsController");
const router = express.Router();


//✅ Branch Settings Routes
router.get("/getSettings", getSettings);

module.exports = router;