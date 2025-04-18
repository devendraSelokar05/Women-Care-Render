const express = require("express");
const router = express.Router();

const { getAllCustomers, getCustomerById } = require("../../controllers/branchAdmin-Controllers/branchAdminCustomerController");
const branchAdminAuthMiddleware = require("../../middlewares/branchAdminMiddleware");

//✅ Branch Admin Customer Routes
router.get("/getAll-customers", branchAdminAuthMiddleware, getAllCustomers);
router.get("/customer/:userId", branchAdminAuthMiddleware, getCustomerById);

module.exports = router;
