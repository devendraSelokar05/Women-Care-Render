const { Router } = require("express");
const branchAdminAuthMiddleware = require("../../middlewares/branchAdminMiddleware");
const {
    getBranchAdminNotificationCount,
    getBranchAdminReadNotifications,
    getBranchAdminUnreadNotifications,
    updateBranchAdminStatusOfUnreadNotification,
    updateBranchAdminAllStatusOfUnreadNotification,
} = require("../../controllers/branchAdmin-Controllers/branchAdminNotification-Controller");
const router = Router();
 
//✅ Branch Admin Notification Routes
router.get(
    "/getNotificationCount",
    branchAdminAuthMiddleware,
    getBranchAdminNotificationCount
);
router.get(
    "/getReadNotification",
    branchAdminAuthMiddleware,
    getBranchAdminReadNotifications
);
router.get(
    "/getUnreadNotification",
    branchAdminAuthMiddleware,
    getBranchAdminUnreadNotifications
);
router.put(
    "/updateStatus/:id",
    branchAdminAuthMiddleware,
    updateBranchAdminStatusOfUnreadNotification
);
router.put(
    "/updateAll",
    branchAdminAuthMiddleware,
    updateBranchAdminAllStatusOfUnreadNotification
);
 
module.exports = router;