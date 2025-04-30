const express = require("express");
const {
    getAllBranchesCount,
    getAllDelieveryBoysCount,
    getAllCustomersCount,
    getAllBranchesDropdown,
    getAllOrdersCount,
    getBranchOverview,
    getDeliveryReport,
    getIncomeOverview,
    getYearDropdownData,
} = require("../../controllers/SuperAdmin-Controllers/dashboardController");
const router = express.Router();
 
//✅ SuperAdmin Dashboard Routes
router.get("/getAllBranchesCount", getAllBranchesCount);
router.get("/getAllDelieveryBoysCount", getAllDelieveryBoysCount);
router.get("/getAllCustomersCount", getAllCustomersCount);
router.get("/getAllOrdersCount", getAllOrdersCount);
router.get("/getYearDropdownData", getYearDropdownData);
router.get("/getAllBranchesDropdown", getAllBranchesDropdown);
router.get("/getBranchOverview", getBranchOverview);
router.get("/getIncomeOverview", getIncomeOverview);
router.get("/getDeliveryReport", getDeliveryReport);
 
module.exports = router;