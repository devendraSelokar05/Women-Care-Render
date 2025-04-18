const express = require("express");
const {
    login,
    verifyOtp,
    resendOtp,
    getUser,
    updateUser,
    logout,
    register,
} = require("../../controllers/UserControllers/userController");
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { upload } = require("../../config/cloudinary");
 
const router = express.Router();
 
//✅ User Routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
 
router.get("/getUser", userValidateToken, getUser);
router.put(
    "/updateUser",
    userValidateToken,
    upload.single("image"),
    updateUser
);
router.post("/logout", userValidateToken, logout);
 
module.exports = router;