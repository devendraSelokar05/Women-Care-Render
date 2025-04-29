const express = require("express");
const { getSingleBanner } = require("../../controllers/UserControllers/userBannerController");

const router = express.Router();

router.get("/getBanner", getSingleBanner);

module.exports = router;