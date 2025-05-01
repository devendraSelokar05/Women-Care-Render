const branchAdmin = require("../../models/BranchAdminModels/branchAdmin");
const branchAdminNotificationModel = require("../../models/BranchAdminModels/branchAdminNotification");
const deliveryBoyNotificationModel = require("../../models/DeliveryBoyModel/deliveryBoyNotification");
const DeliveryBoyModel = require("../../models/SuperAdminModels/DeliveryBoy");
const superAdminNotificationModel = require("../../models/SuperAdminModels/superAdminNotification");
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
  Customer: {
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
        message:
          "notificationTitle, notificationMessage & usersType are required.",
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

//create Notification
const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    // Validate request data
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    // Create notification document
    const notification = new superAdminNotificationModel({
      title,
      message,
    });

    // Save notification to the database
    await notification.save();
    return res.status(201).json({ success: true, message: "Notification created successfully." });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ Get SuperAdmin Read Notifications
const getSuperAdminReadNotification = async(req, res)=>{
  try {
    const notifications = await superAdminNotificationModel.find({
      isRead: true
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get SuperAdmin Unread Notifications
const getSuperAdminUnreadNotification = async(req, res)=>{
  try {
    const notifications = await superAdminNotificationModel.find({
      isRead: false
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Update SuperAdmin Status of Unread Notification
const updateSuperAdminStatusOfUnreadNotification = async (req, res) => {
  try {
      const { id } = req.params;
      const result = await superAdminNotificationModel.updateOne(
          { _id: id },
          { $set: { isRead: true } }
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






module.exports = {
  getUsersTypeDropdown,
  addNotification,
  createNotification,
  getSuperAdminReadNotification,
  getSuperAdminUnreadNotification,
  updateSuperAdminStatusOfUnreadNotification
};
