const { client, twilioPhone } = require("../../config/twilo");
const jwt = require("jsonwebtoken");
const userModel = require("../../models/UserModels/User");

//✅ Register
const register = async (req, res) => {
  try {
    const { fullName, gender, mobileNumber, address } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!fullName) missingFields.push("Full Name");
    if (!gender) missingFields.push("Gender");
    if (!mobileNumber) missingFields.push("Mobile Number");
    if (!address) missingFields.push("Address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const isValidPhone = /^[6-9]\d{9}$/.test(mobileNumber);
    if (!isValidPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number format." });
    }

    const existingUser = await userModel.exists({
      phoneNumber: mobileNumber,
      isVerified: true,
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this mobile number",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const notVerifiedUser = await userModel.findOne({
      phoneNumber: mobileNumber,
      isVerified: false,
    });
    if (notVerifiedUser) {
      await userModel.findOneAndUpdate(
        { phoneNumber: mobileNumber },
        { otp, otpExpiresAt, fullName, gender, address },
      );
    }
    else{
      const newUser = new userModel({
        fullName,
        gender,
        phoneNumber: mobileNumber,
        address,
        otp,
        otpExpiresAt,
      });
      await newUser.save();
    }

   return res.status(201).json({
      success: true,
      message: "OTP sent successfully.",
      data: { otp },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//✅ Login
const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: "Phone number is required" });

    const isValidPhone = /^[6-9]\d{9}$/.test(phoneNumber);
    if (!isValidPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number format." });
    }

    // Check if user exists
    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "User is not verified. Please complete OTP verification during registration.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true, data: { otp } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp)
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });

    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified → clear otp
    user.otp = null;
    user.otpExpiresAt = null;

    if (!user.isVerified) {
      user.isVerified = true; // ✅ only set during registration
    }

    await user.save();

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: "Phone number is required" });

    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Send OTP
    // await client.messages.create({
    //     body: `Your new OTP is ${otp}`,
    //     from: twilioPhone,
    //     to: `+91${phoneNumber}`,
    // });

    // Update OTP
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    res.status(200).json({
      message: "OTP resent successfully",
      success: true,
      data: { otp },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get User
const getUser = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("-otp -otpExpiresAt");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Update User
const updateUser = async (req, res) => {
  try {
    const updatableFields = [
      "fullName",
      "phoneNumber",
      "gender",
      "email",
      "address",
    ];
    const updates = {};
    const image = req.file?.path;

    // Dynamically collect valid fields from req.body
    for (const field of updatableFields) {
      if (req.body[field]) updates[field] = req.body[field];
    }

    if (image) updates.image = image;

    // If no fields are provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    // Update and return the new user data
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, select: "-otp -otpExpiresAt" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//✅ logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful", success: true });
  } catch (error) {
    console.error("Server Error:", error);
    res
      .status(500)
      .json({ message: "Server error", success: false, error: error.message });
  }
};
module.exports = {
  login,
  register,
  verifyOtp,
  resendOtp,
  getUser,
  updateUser,
  logout,
};
