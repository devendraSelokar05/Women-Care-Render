const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require("../../utils/decrypt");

const SuperAdminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    encryptedPassword: {
      type: String,
      select: false,
    },
    contactNumber: {
      type: String,
      required: true,
      minlength: [10, 'Contact number must be 10 digits'],
    },
    profileImage: {
      type: String,
      default:
        'https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png',
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
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

// Hash and encrypt password before saving
SuperAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.encryptedPassword = encrypt(this.password); // save original password encrypted
    this.password = hashed;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords for login
SuperAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get decrypted password
SuperAdminSchema.methods.getPlainPassword = function () {
  return decrypt(this.encryptedPassword);
};

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);
