const { Router } = require("express");
const {
    getUsersTypeDropdown,
    addNotification,
    createNotification,
    getSuperAdminReadNotification,
    getSuperAdminUnreadNotification,
    updateSuperAdminStatusOfUnreadNotification,
 
  
} = require("../../controllers/SuperAdmin-Controllers/notificationController");
const { upload } = require("../../config/cloudinary");
const router = Router();
 
//✅ SuperAdmin Notification Routes
router.get("/getUsersType", getUsersTypeDropdown);
router.post("/addNotification", upload.single("image"), addNotification);
router.post("/createNotification", createNotification);
router.get("/getReadNotification", getSuperAdminReadNotification);
router.get("/getUnreadNotification", getSuperAdminUnreadNotification);
router.put("/updateStatus/:id", updateSuperAdminStatusOfUnreadNotification);
 
module.exports = router;