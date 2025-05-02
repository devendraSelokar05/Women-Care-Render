const express = require('express');
const router = express.Router();

const { getBranchDetails } = require("../../controllers/branchAdmin-Controllers/branchDetailsController");

//✅ Branch Details Routes
router.get("/branch/:branchId", getBranchDetails);

module.exports = router;