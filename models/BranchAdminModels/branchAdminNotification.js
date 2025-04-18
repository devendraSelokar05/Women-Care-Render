const { Schema, model } = require("mongoose");
 
const branchAdminNotificationSchema = new Schema(
    {
        branchAdminId: {
            type: Schema.Types.ObjectId,
            ref: "BranchAdmin",
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
 
const branchAdminNotificationModel = model("BranchAdminNotification", branchAdminNotificationSchema);
module.exports = branchAdminNotificationModel;