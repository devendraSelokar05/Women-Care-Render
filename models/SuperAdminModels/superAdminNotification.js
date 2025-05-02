const { Schema, model } = require("mongoose");
 
const superAdminNotificationSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
 
const superAdminNotificationModel = model("superAdminNotification", superAdminNotificationSchema);
module.exports = superAdminNotificationModel;