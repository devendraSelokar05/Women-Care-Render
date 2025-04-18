const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const SuperAdminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
  otp: {
    type: String, // Corrected to String (uppercase)
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
  
}, { timestamps: true });
 
// Mongoose Middleware: Hash password before saving
SuperAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
 
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
 
// Method to compare passwords
SuperAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
 
module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);