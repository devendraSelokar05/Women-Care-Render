const deliveryBoyNotificationModel = require("../../models/DeliveryBoyModel/deliveryBoyNotification");
const {
    getUnreadNotificationCount,
    fetchNotifications,
    updateNotificationStatus,
    updateAllNotificationsStatus,
} = require("../../utils/notifications");
 
//✅ Get Delivery Boy Notficationa Count
const getDeliveryBoyNotificationCount = async (req, res) => {
    try {
        const count = await getUnreadNotificationCount(
            deliveryBoyNotificationModel,
            req.deliveryBoy._id,
            "deliveryBoyId"
        );
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Get Delivery Boy Read Notifications
const getDeliveryBoyReadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            deliveryBoyNotificationModel,
            req.deliveryBoy._id,
            true,
            "deliveryBoyId"
        );
 
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No read notifications found.",
            });
        }
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Get Delivery Boy Unread Notifications
const getDeliveryBoyUnreadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            deliveryBoyNotificationModel,
            req.deliveryBoy._id,
            false,
            "deliveryBoyId"
        );
 
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No read notifications found.",
            });
        }
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 //✅ Update Delivery Boy Status Of Unread Notification
const updateDeliveryBoyStatusOfUnreadNotification = async (req, res) => {
    try {
        const { id } = req.params;
 
        const result = await updateNotificationStatus(
            deliveryBoyNotificationModel,
            id,
            req.deliveryBoy._id,
            "deliveryBoyId"
        );
 
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or already marked as read",
            });
        }
 
        res
            .status(200)
            .json({ success: true, message: "Status updated successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Update Delivery Boy All Notifications Status
const updateDeliveryBoyAllNotificationsStatus = async (req, res) => {
    try {
        const result = await updateAllNotificationsStatus(
            deliveryBoyNotificationModel,
            req.deliveryBoy._id,
            "deliveryBoyId"
        );
 
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No unread notifications found",
            });
        }
 
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
module.exports = {
    getDeliveryBoyNotificationCount,
    getDeliveryBoyReadNotifications,
    getDeliveryBoyUnreadNotifications,
    updateDeliveryBoyStatusOfUnreadNotification,
    updateDeliveryBoyAllNotificationsStatus,
};
 
 
 
 
 