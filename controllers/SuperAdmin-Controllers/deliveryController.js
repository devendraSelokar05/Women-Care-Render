const DeliveryBoyModel = require("../../models/SuperAdminModels/DeliveryBoy");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const BranchModel = require("../../models/SuperAdminModels/branch");
const { encrypt } = require("../../utils/decrypt");

//✅ Add Delivery Boy
const addDeliveryBoy = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, userId, password, address, branch } = req.body;
    const image = req.file?.path;

    if (!fullName || !email || !phoneNumber || !userId || !password || !address || !branch) {
      return res.status(400).json({ success: false, message: "Provide all the fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const branchDoc = await BranchModel.findOne({ branchName: branch.trim() });

    if (!branchDoc) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const existingUser = await DeliveryBoyModel.findOne({
      $or: [{ email }, { phoneNumber }, { userId }],
    });

    if (existingUser) {
      let message = "Delivery boy with this ";
      if (existingUser.email === email) message += "email already exists.";
      else if (existingUser.phoneNumber.toString() === phoneNumber)
        message += "phone number already exists.";
      else if (existingUser.userId === userId) message += "userId already exists.";

      return res.status(400).json({ success: false, message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedPassword =encrypt(password);

    const newDeliveryBoy = new DeliveryBoyModel({
      fullName,
      email,
      phoneNumber,
      userId,
      password: hashedPassword,
      address,
      branch,
      image,
      encryptedPassword,
    });

    await newDeliveryBoy.save();

    res.status(201).json({
      success: true,
      message: "Delivery boy added successfully!",
      newDeliveryBoy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get All Delivery Boys
const getAllDeliveryBoys = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", branch, sortOrder } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Determine sorting order (default to no sorting if sortOrder is not provided)
    let sortOption = {};
    if (sortOrder === "asc" || sortOrder === "desc") {
      sortOption.fullName = sortOrder === "desc" ? -1 : 1;
    }
    if (!sortOrder) {
      sortOption = { createdAt: -1 };
    }

    // Create a search filter
    const searchFilter = {
      isDeleted: false,
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ],
    };

    if (branch) {
      searchFilter.branch = branch;
    }

    const totalDeliveryBoys = await DeliveryBoyModel.countDocuments(
      searchFilter
    );
    const deliveryBoys = await DeliveryBoyModel.find(searchFilter)
      .sort(sortOption) // Apply sorting only if provided
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalDeliveryBoys / limit);
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    res.status(200).json({
      success: true,
      totalDeliveryBoys,
      totalPages,
      currentPage: page,
      previous: hasPrevious,
      next: hasNext,
      deliveryBoys,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get Delivery Boy By Id
const getDeliveryBoyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery boy ID." });
    }
    
    // Make sure to explicitly select encryptedPassword field
    const deliveryBoy = await DeliveryBoyModel.findById(id).select("+encryptedPassword");
    
    if (!deliveryBoy) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found." });
    }
    
    // ✅ Decrypt password safely
    let plainPassword = "Not available";
    try {
      // Check if encryptedPassword exists before trying to decrypt
      if (deliveryBoy.encryptedPassword) {
        plainPassword = deliveryBoy.getPlainPassword();
        console.log("Decrypted password:", plainPassword); // For debugging
      } else {
        console.log("No encrypted password found");
        plainPassword = "No encrypted password available";
      }
    } catch (err) {
      console.error("Decryption error:", err.message);
      plainPassword = "Decryption error: " + err.message;
    }
    
    // // For debugging
    // console.log({
    //   hashedPassword: deliveryBoy.password,
    //   encryptedPassword: deliveryBoy.encryptedPassword,
    //   decryptedPassword: plainPassword
    // });
    
    res.status(200).json({
      success: true,
      data: {
        fullName: deliveryBoy.fullName,
        email: deliveryBoy.email,
        password: plainPassword,
        phoneNumber: deliveryBoy.phoneNumber,
        userId: deliveryBoy.userId,
        address: deliveryBoy.address,
        branch: deliveryBoy.branch,
        image: deliveryBoy.image,
        
      }
    });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Update Delivery Boy
const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, userId, password, address, branch } = req.body;
    const image = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid delivery boy ID." });
    }

    // Get branch document (optional - customize logic here)
    let branchDoc;
    if (branch) {
      branchDoc = await BranchModel.findOne({ branchName: branch });
      if (!branchDoc) {
        return res.status(404).json({ success: false, message: "Branch not found." });
      }
    }

    const deliveryBoy = await DeliveryBoyModel.findById(id);
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: "Delivery boy not found." });
    }

    // Check for duplicate email/userId/phone
    if (email || phoneNumber || userId) {
      const existingUser = await DeliveryBoyModel.findOne({
        $or: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null,
          userId ? { userId } : null,
        ].filter(Boolean),
        _id: { $ne: id },
      });

      if (existingUser) {
        let message = "Delivery boy with this ";
        if (existingUser.email === email) message += "email ";
        else if (existingUser.phoneNumber === phoneNumber) message += "phone number ";
        else if (existingUser.userId === userId) message += "userId ";
        message += "already exists.";
        return res.status(400).json({ success: false, message });
      }
    }

    // Assign updates
    if (fullName) deliveryBoy.fullName = fullName;
    if (email) deliveryBoy.email = email;
    if (phoneNumber) deliveryBoy.phoneNumber = phoneNumber;
    if (userId) deliveryBoy.userId = userId;
    if (address) deliveryBoy.address = address;
    if (branch) deliveryBoy.branch = branch;
    if (image) deliveryBoy.image = image;
    if (password) deliveryBoy.password = password; // Let pre-save handle hashing

    await deliveryBoy.save(); // 🔁 Triggers pre-save hashing

    res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully!",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Error updating delivery boy:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


//✅ Delete Delivery Boy
const deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery boy ID." });
    }

    const deliveryBoy = await DeliveryBoyModel.findByIdAndUpdate(id, { isDeleted: true });

    if (!deliveryBoy) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Delivery boy deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDeliveryBoys,
  addDeliveryBoy,
  getDeliveryBoyById,
  updateDeliveryBoy,
  deleteDeliveryBoy,
};
