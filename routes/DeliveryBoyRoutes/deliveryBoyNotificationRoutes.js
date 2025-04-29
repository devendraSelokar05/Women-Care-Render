const { Router } = require("express");
 
const deliveryBoyAuthMiddleware = require("../../middlewares/deliveryBoyAuthMiddleware");
const { getDeliveryBoyNotificationCount, getDeliveryBoyReadNotifications, getDeliveryBoyUnreadNotifications, updateDeliveryBoyStatusOfUnreadNotification, updateDeliveryBoyAllNotificationsStatus } = require("../../controllers/deliveryBoy-Controllers/deliveryBoyNotificationController");
const router = Router();
 
router.get("/getNotificationCount", deliveryBoyAuthMiddleware, getDeliveryBoyNotificationCount);
router.get("/getReadNotification", deliveryBoyAuthMiddleware, getDeliveryBoyReadNotifications);
router.get("/getUnreadNotification", deliveryBoyAuthMiddleware, getDeliveryBoyUnreadNotifications);
router.put("/updateStatus/:id", deliveryBoyAuthMiddleware, updateDeliveryBoyStatusOfUnreadNotification);
router.put("/updateAll", deliveryBoyAuthMiddleware, updateDeliveryBoyAllNotificationsStatus);
 
module.exports = router;