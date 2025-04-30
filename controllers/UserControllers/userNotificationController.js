const userNotificationModel = require("../../models/UserModels/userNotification");
const {
    getUnreadNotificationCount,
    fetchNotifications,
    updateNotificationStatus,
    updateAllNotificationsStatus,
} = require("../../utils/notifications");
 
//✅ User Notification Count
const getUserNotificationCount = async (req, res) => {
    try {
        const count = await getUnreadNotificationCount(
            userNotificationModel,
            req.user._id,
            "userId"
        );
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
// ✅ Get User Read Notifications
const getUserReadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            userNotificationModel,
            req.user._id,
            true,
            "userId"
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
 
//✅ get User Unread Notifications
const getUserUnreadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            userNotificationModel,
            req.user._id,
            false,
            "userId"
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
 
//✅ Update User Status Of Unread Notification
const updateUserStatusOfUnreadNotification = async (req, res) => {
    try {
        const { id } = req.params;
 
        const result = await updateNotificationStatus(
            userNotificationModel,
            id,
            req.user._id,
            "userId"
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
 
//✅ Update User All Notifications Status
const updateUserAllNotificationsStatus = async (req, res) => {
    try {
        const result = await updateAllNotificationsStatus(
            userNotificationModel,
            req.user._id,
            "userId"
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
    getUserNotificationCount,
    getUserReadNotifications,
    getUserUnreadNotifications,
    updateUserStatusOfUnreadNotification,
    updateUserAllNotificationsStatus,
};
 
 