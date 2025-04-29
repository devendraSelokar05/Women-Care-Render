const express = require("express");
const { getSingleBanner } = require("../../controllers/UserControllers/userBannerController");

const router = express.Router();

//✅ User Banner Routes
router.get("/getBanner", getSingleBanner);

module.exports = router;