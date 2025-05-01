const express = require("express");
const { getDeliveryBoyTermsandCondition } = require("../../controllers/deliveryBoy-Controllers/delieveryBoysettingsController");

const router = express.Router();


router.get("/getSettings", getDeliveryBoyTermsandCondition);

module.exports = router;
