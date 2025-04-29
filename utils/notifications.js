const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const dayjsCustomFormat = require("dayjs/plugin/customParseFormat");
const dayjsTimezone = require("dayjs/plugin/timezone");
 
// Extend dayjs with necessary plugins
dayjs.extend(relativeTime);
dayjs.extend(dayjsCustomFormat);
dayjs.extend(dayjsTimezone);
 
// Helper function to format notification time according to requirements
const formatNotificationTime = (createdAt) => {
    // Ensure both dates are using the same timezone handling
    const currentDate = dayjs();
    // Explicitly parse the date to ensure correct handling
    const createdDate = dayjs(createdAt);

    // Use startOf('day') to compare just the dates, not times
    const daysDiff = currentDate.startOf('day').diff(createdDate.startOf('day'), "day");
    const hoursDiff = currentDate.diff(createdDate, "hour");

    if (hoursDiff < 1) {
        // For first hour -> show minutes ago
        return createdDate.fromNow();
    } else if (daysDiff === 0) {
        // Same calendar day -> today and exact time
        return `Today at ${createdDate.format("hh:mm A")};`
    } else if (daysDiff === 1) {
        // Previous calendar day -> yesterday and exact time
        return `Yesterday at ${createdDate.format("hh:mm A")}`;
    } else {
        // Earlier than yesterday -> DD/MM/YYYY and exact time
        return` ${createdDate.format("DD/MM/YYYY")} at ${createdDate.format("hh:mm A")}`;
    }
};
 
// Helper function to count unread notifications
const getUnreadNotificationCount = async (
    model,
    userId,
    userIdField
) => {
    try {
        const count = await model.countDocuments({
            [userIdField]: userId,
            isRead: false,
        });
        return count;
    } catch (error) {
        throw new Error("Error counting unread notifications: " + error.message);
    }
};
 
// Helper function to fetch notifications from a model
const fetchNotifications = async (
    model,
    userId,
    isRead,
    userIdField
) => {
    try {
        let notifications = await model
            .find({ [userIdField]: userId, isRead })
            .populate({
                path: userIdField,
                select: 'title message fullName image isRead createdAt'
            })
            .sort({ createdAt: -1 })
            .exec();
 
        notifications = notifications.map((notification) => {
            const { createdAt, ...rest } = notification._doc; // Destructure to remove createdAt
            return {
                ...rest,
                timeAgo: formatNotificationTime(notification.createdAt),
            };
        });
        return notifications;
    } catch (error) {
        throw new Error("Error fetching notifications: " + error.message);
    }
};
 
// Helper function to update the status of unread notifications
const updateNotificationStatus = async (
    model,
    notificationId,
    userId,
    userIdField
) => {
    try {
        const result = await model.updateOne(
            { [userIdField]: userId, _id: notificationId, isRead: false },
            { $set: { isRead: true } }
        );
        return result;
    } catch (error) {
        throw new Error("Error updating notification status: " + error.message);
    }
};
 
// Helper function to update status of all unread notifications
const updateAllNotificationsStatus = async (
    model,
    userId,
    userIdField
) => {
    try {
        const result = await model.updateMany(
            { [userIdField]: userId, isRead: false },
            { $set: { isRead: true } }
        );
        return result;
    } catch (error) {
        throw new Error("Error updating all notifications: " + error.message);
    }
};
 
//Helper Function for send stock Notification to superAdmin
const sendStockNotificationToSuperAdmin = async (req, res) => {
    try {
        const { productId, productName, currentStock } = req.body;
        
        // Input validation
        if (!productId || !productName) {
            return res.status(400).json({
                success: false,
                message: "productId and productName are required.",
            });
        }
        
        // Create notification for superAdmin
        const notification = new superAdminNotificationModel({
            title: "Stock Alert",
            message: `The stock for ${productName} has been depleted or is running low.`,
            productId: productId,
            stockInfo: {
                productName,
                currentStock: currentStock || 0,
                timestamp: new Date()
            }
        });
        
        await notification.save();
        
        return res.status(200).json({
            success: true,
            message: "Stock notification sent to SuperAdmin successfully!",
        });
    } catch (error) {
        console.error("Error sending stock notification:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = {
    getUnreadNotificationCount,
    formatNotificationTime,
    fetchNotifications,
    updateNotificationStatus,
    updateAllNotificationsStatus,
    sendStockNotificationToSuperAdmin,
};
 