const mongoose = require("mongoose");
 
const SettingsSchema = new mongoose.Schema(
  {
    emergencyDeliveryFee: { type: Number, default: 0 },
    settingType: {
      type: String,
      enum: ["Customer Website", "Mobile App", "Other"],
      required: true,
    },
    termsAndConditions: {
      description: [{ type: String }],
    },
    privacyPolicy: {
      description: [{ type: String }],
    },
    aboutUs: {
      description: [{ type: String }],
      images: [{ type: String }],
    },
    referAndEarn: {
      description: [{ type: String }],
      images: [{ type: String }],
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Settings", SettingsSchema);