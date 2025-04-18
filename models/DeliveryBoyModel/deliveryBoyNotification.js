const { Schema, model } = require("mongoose");
 
const deliveryBoyNotificationSchema = new Schema(
    {
        deliveryBoyId: {
            type: Schema.Types.ObjectId,
            ref: "DeliveryBoy",
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
 
const deliveryBoyNotificationModel = model("DeliveryBoyNotification", deliveryBoyNotificationSchema);
module.exports = deliveryBoyNotificationModel;
 
 
