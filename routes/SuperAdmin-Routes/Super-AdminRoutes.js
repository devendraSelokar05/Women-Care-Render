const express = require('express');
const {register, login, resetPassword, forgotPassword, verifyOtp, logout, updateAdminProfile, getAdminProfile, changeAdminPasswordAtProfile} =  require('../../controllers/SuperAdmin-Controllers/SuperAdminController')
const { upload } = require('../../config/cloudinary');
const superAdminAuthMiddleware = require('../../middlewares/superAdminMiddleware');
 
const router = express.Router();
 
//✅ SuperAdmin Admin Routes
router.post('/register',upload.fields([
    { name: "profileImage", maxCount: 1 },
  ]),register)
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.put('/UpdateProfile/:id', superAdminAuthMiddleware, upload.fields([
  { name: "profileImage", maxCount: 1 },
]), updateAdminProfile);
router.get('/get-admin-profile/:id', superAdminAuthMiddleware, getAdminProfile);
router.put('/change-password/:id', superAdminAuthMiddleware, changeAdminPasswordAtProfile);
router.post('/logout', superAdminAuthMiddleware, logout);
 
module.exports = router;