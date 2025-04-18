const branchAdmin = require("../../models/BranchAdminModels/branchAdmin");
const branchAdminNotificationModel = require("../../models/BranchAdminModels/branchAdminNotification");
const deliveryBoyNotificationModel = require("../../models/DeliveryBoyModel/deliveryBoyNotification");
const DeliveryBoyModel = require("../../models/SuperAdminModels/DeliveryBoy");
const userModel = require("../../models/UserModels/User");
const userNotificationModel = require("../../models/UserModels/userNotification");
 
//✅ Get Users Type Dropdown
const getUsersTypeDropdown = (req, res) => {
    try {
        const usersType = ["Customer", "Delivery Boy", "Branch Admin"];
        res.status(200).json({ success: true, usersType });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
// Optimization: mapping user type to model, idKey, and notification model
const userTypeMap = {
    "Customer": {
        model: userModel,
        key: "userId",
        notificationModel: userNotificationModel,
    },
    "Delivery Boy": {
        model: DeliveryBoyModel,
        key: "deliveryBoyId",
        notificationModel: deliveryBoyNotificationModel,
    },
    "Branch Admin": {
        model: branchAdmin,
        key: "branchAdminId",
        notificationModel: branchAdminNotificationModel,
    },
};
 

//✅ Add Notification
const addNotification = async (req, res) => {
    try {
        const { notificationTitle, notificationMessage, usersType } = req.body;
        const image = req.file?.path;
 
        // Input validation
        if (!notificationTitle || !notificationMessage || !usersType) {
            return res.status(400).json({
                success: false,
                message: "Notification title, message, and user type are required.",
            });
        }
 
        const userTypeData = userTypeMap[usersType];
 
        if (!userTypeData) {
            return res.status(400).json({
                success: false,
                message: "Invalid user type provided.",
            });
        }
 
        const users = await userTypeData.model.find().select("_id");
 
        const notifications = users.map((user) => ({
            [userTypeData.key]: user._id,
            title: notificationTitle,
            message: notificationMessage,
            image: image || null,
        }));
 
        await userTypeData.notificationModel.insertMany(notifications);
 
        res.status(200).json({
            success: true,
            message: "Notification sent successfully!",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
module.exports = { getUsersTypeDropdown, addNotification };
 