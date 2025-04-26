const { Router } = require("express");
const {
    getUsersTypeDropdown,
    addNotification,
} = require("../../controllers/SuperAdmin-Controllers/notificationController");
const { upload } = require("../../config/cloudinary");
const router = Router();
 
//✅ SuperAdmin Notification Routes
router.get("/getUsersType", getUsersTypeDropdown);
router.post("/addNotification", upload.single("image"), addNotification);
 
module.exports = router;