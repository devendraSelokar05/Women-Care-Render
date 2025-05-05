const DeliveryBoy = require("../../models/SuperAdminModels/DeliveryBoy")
const jwt = require("jsonwebtoken");
 
//✅ Login Delivery Boy
const LoginDeliveryBoy = async (req, res) => {
    try {
      const { userId, password } = req.body;
      console.log(userId, password);
      // Check if the delivery boy exists
      const deliveryBoy = await DeliveryBoy.findOne({ userId });
      if (!deliveryBoy) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
  
      // Compare the password
      const isPasswordMatch = await deliveryBoy.matchPassword(password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET, {
        expiresIn: "1y",
      });
  
      // Send response
      res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        deliveryBoy: {
          id: deliveryBoy._id,
          fullName: deliveryBoy.fullName,
          email: deliveryBoy.email,
          phoneNumber: deliveryBoy.phoneNumber,
          userId: deliveryBoy.userId,
          address: deliveryBoy.address,
          branch: deliveryBoy.branch,
          profileImage: deliveryBoy.image,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
  

 
//✅ Get Delivery Boy Profile
const getDeliveryBoyProfile = async (req, res) => {
    try {
        const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id).populate("branch").select("fullName email phoneNumber userId address updatedAt createdAt encryptedPassword");;
        if (!deliveryBoy) {
            return res.status(404).json({ message: "Profile not found." });
        }
        let plainPassword = "Not available";
        try {
          // Check if encryptedPassword exists before trying to decrypt
          if (deliveryBoy.encryptedPassword) {
            plainPassword = deliveryBoy.getPlainPassword();
            // console.log("Decrypted password:", plainPassword); // For debugging
          } else {
            // console.log("No encrypted password found");
            plainPassword = "No encrypted password available";
          }
        } catch (err) {
          console.error("Decryption error:", err.message);
          plainPassword = "Decryption error: " + err.message;
        }
        deliveryBoy.password = plainPassword;
        return res.json({
          success: true,
          message: "Delivery Boy Profile fetched successfully.",
          deliveryBoy: {
            fullName: deliveryBoy.fullName,
            email: deliveryBoy.email,
            password: plainPassword,
            phoneNumber: deliveryBoy.phoneNumber,
            userId: deliveryBoy.userId,
            address: deliveryBoy.address,
            updatedAt: deliveryBoy.updatedAt,
            createdAt: deliveryBoy.createdAt,
          },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};
 
//✅ Update Delivery Boy Profile
const updateProfile = async (req, res) => {
  try {
    const profileImage = req.files?.image?.[0]?.path;
 
    const updatedFields = { ...req.body };
 
    if (profileImage) {
      updatedFields.image = profileImage;
    }
 
    const updatedProfile = await DeliveryBoy.findByIdAndUpdate(
      req.deliveryBoy.id,
      updatedFields,
      { new: true }
    );
 
    if (!updatedProfile) {
      return res.status(404).json({ message: "Delivery boy not found." });
    }
 
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      deliveryBoy: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};
 
module.exports = { LoginDeliveryBoy, getDeliveryBoyProfile, updateProfile };
 
