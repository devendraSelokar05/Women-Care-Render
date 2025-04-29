const branchAdminNotificationModel = require("../../models/BranchAdminModels/branchAdminNotification");
const {
    getUnreadNotificationCount,
    fetchNotifications,
    updateNotificationStatus,
    updateAllNotificationsStatus,
} = require("../../utils/notifications");
 

//✅ Branch Admin Notification Controller
const getBranchAdminNotificationCount = async (req, res) => {
    try {
        const count = await getUnreadNotificationCount(
            branchAdminNotificationModel,
            req.branchAdmin._id,
            "branchAdminId"
        );
        return res.status(200).json({ success: true, count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Branch Admin Read Notifications Controller
const getBranchAdminReadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            branchAdminNotificationModel,
            req.branchAdmin._id,
            true,
            "branchAdminId"
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
 
//✅ Branch Admin Unread Notifications Controller
const getBranchAdminUnreadNotifications = async (req, res) => {
    try {
        const notifications = await fetchNotifications(
            branchAdminNotificationModel,
            req.branchAdmin._id,
            false,
            "branchAdminId"
        );
 
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No unread notifications found.",
            });
        }
 
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Branch Admin Update Status of Unread Notification Controller
const updateBranchAdminStatusOfUnreadNotification = async (req, res) => {
    try {
        const { id } = req.params;
 
        const result = await updateNotificationStatus(
            branchAdminNotificationModel,
            id,
            req.branchAdmin._id,
            "branchAdminId"
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
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

//✅ Update Branch Admin All Status Of Unread Notification Controller
const updateBranchAdminAllStatusOfUnreadNotification = async (req, res) => {
    try {
        const result = await updateAllNotificationsStatus(
            branchAdminNotificationModel,
            req.branchAdmin._id,
            "branchAdminId"
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
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
module.exports = {
    getBranchAdminNotificationCount,
    getBranchAdminReadNotifications,
    getBranchAdminUnreadNotifications,
    updateBranchAdminStatusOfUnreadNotification,
    updateBranchAdminAllStatusOfUnreadNotification,
};