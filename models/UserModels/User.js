const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
 
const userSchema = new Schema(
    {
        phoneNumber: {
            type: Number,
            unique: true,
            required: true,
        },
        fullName: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],
        },
        email: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        otp: {
            type: Number,
        },
        otpExpiresAt: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        branchInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branches",
            required: false
          },
          isDeleted: {
            type: Boolean,
            default: false,
          },
    },
    { timestamps: true }
);
 
const userModel = model("User", userSchema);
module.exports = userModel;
 
 
 