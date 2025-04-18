const { Router } = require("express");
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const {
    getUserNotificationCount,
    getUserReadNotifications,
    getUserUnreadNotifications,
    updateUserStatusOfUnreadNotification,
    updateUserAllNotificationsStatus,
} = require("../../controllers/UserControllers/userNotificationController");
const router = Router();

 //✅ User Notification Routes
router.get("/getNotificationCount", userValidateToken, getUserNotificationCount);
router.get("/getReadNotification", userValidateToken, getUserReadNotifications);
router.get("/getUnreadNotification", userValidateToken, getUserUnreadNotifications);
router.put("/updateStatus/:id", userValidateToken, updateUserStatusOfUnreadNotification);
router.put("/updateAll", userValidateToken, updateUserAllNotificationsStatus);
 
module.exports = router;
 