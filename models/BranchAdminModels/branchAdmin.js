const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const{encrypt, decrypt}= require("../../utils/decrypt")
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
    encryptedPassword: {
      type: String,
      select: false, // hide by default unless explicitly selected
    },
    contactNumber: {
      type: String,
      required: true,
      minlength: [10, "Contact number must be 10 digits"],
    },
    otp: String,
    otpExpires: Date,
    profileImage: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branches",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// Hash password & encrypt original
branchAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
   
    const salt = await bcrypt.genSalt(10);
    this.encryptedPassword = encrypt(this.password);
    this.password = await bcrypt.hash(this.password, salt)

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
branchAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Decrypt original password
branchAdminSchema.methods.getPlainPassword = function () {
  if (!this.encryptedPassword) return null;
  return decrypt(this.encryptedPassword);
};

module.exports = mongoose.model("BranchAdmin", branchAdminSchema);
