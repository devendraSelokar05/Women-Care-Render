const { Schema, model } = require("mongoose");
 
const userNotificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
 
const userNotificationModel = model("UserNotification", userNotificationSchema);
module.exports = userNotificationModel;