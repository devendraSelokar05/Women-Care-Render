const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
 
const branchAdminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
      
    },
    contactNumber: {
      type: String,
      required: true,
      minlength: [10, "Contact number must be 10 digits"]
    },
    otp: {
      type: String, // Used for OTP verification
    },
    otpExpires: {
      type: Date, // Expiration time for OTP
    },
    profileImage: {
      type: String, // Store profile image URL
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branches", // Reference to Branch schema
      required: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);
 // Mongoose Middleware: Hash password before saving
branchAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
   
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
   
  // Method to compare passwords
  branchAdminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
   
  module.exports = mongoose.model("BranchAdmin", branchAdminSchema);