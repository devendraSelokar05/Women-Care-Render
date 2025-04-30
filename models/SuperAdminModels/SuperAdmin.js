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
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
  },
  contactNumber: {
    type: String,
    required: true,
    minlength: [10, "Contact number must be 10 digits"]
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