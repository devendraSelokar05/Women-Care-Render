const express = require("express");
const { getAllBanners } = require("../../controllers/UserControllers/userBannerController");

const router = express.Router();

//✅ User Banner Routes
router.get("/getAllBanners", getAllBanners);

module.exports = router;