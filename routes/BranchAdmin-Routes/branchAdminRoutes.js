const express = require('express');
const {register,login,forgotPassword,verifyOtp,resetPassword,logout, getBranchAdminProfile, updateBranchAdminProfile} =  require('../../controllers/branchAdmin-Controllers/branchAdminController')
const router = express.Router();
const { upload } = require('../../config/cloudinary');
const branchAdminAuthMiddleware = require('../../middlewares/branchAdminMiddleware');
 
//✅ Branch Admin Routes
router.post('/register', upload.fields([
    { name: "profileImage", maxCount: 1 },]) ,register);
router.post('/login',  login);
router.post('/forgot-password',forgotPassword);
router.post('/verify-otp',verifyOtp);
router.put('/updateProfile/:id', branchAdminAuthMiddleware, upload.fields([
    { name: "profileImage", maxCount: 1 },
  ]), updateBranchAdminProfile);
router.post('/reset-password',resetPassword);
router.post('/logout',logout);
router.get('/getProfile/:id', branchAdminAuthMiddleware, getBranchAdminProfile);

 
module.exports = router;