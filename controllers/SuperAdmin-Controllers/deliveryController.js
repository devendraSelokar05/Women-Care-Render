const DeliveryBoyModel = require("../../models/SuperAdminModels/DeliveryBoy");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");



//✅ Add Delivery Boy
const addDeliveryBoy = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, userId, password, address, branch } =
      req.body;
    const image = req.file?.path;

    // Check if all required fields are provided
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !userId ||
      !password ||
      !address ||
      !branch
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Provide all the fields" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Check if email, phoneNumber, or userId already exists (Single DB query)
    const existingUser = await DeliveryBoyModel.findOne({
      $or: [{ email }, { phoneNumber }, { userId }],
    });

    if (existingUser) {
      let message = "Delivery boy with this ";

      if (existingUser.email === email) {
        message += "email already exists.";
      } else if (existingUser.phoneNumber.toString() === phoneNumber) {
        message += "phone number already exists.";
      } else if (existingUser.userId === userId) {
        message += "userId already exists.";
      }

      return res.status(400).json({ success: false, message });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new delivery boy entry
    const newDeliveryBoy = new DeliveryBoyModel({
      fullName,
      email,
      phoneNumber,
      userId,
      password,
      address,
      branch,
      image,
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

    // Create a search filter
    const searchFilter = {
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

    const deliveryBoy = await DeliveryBoyModel.findById(id);

    if (!deliveryBoy) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found." });
    }

    res.status(200).json({ success: true, deliveryBoy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Update Delivery Boy
const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, userId, password, address, branch } =
      req.body;
    const image = req.file?.path; // Get image if uploaded

    // Validate if `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery boy ID." });
    }

    // Find the existing delivery boy
    const deliveryBoy = await DeliveryBoyModel.findById(id);
    if (!deliveryBoy) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found." });
    }

    // Check if email, phoneNumber, or userId already exists (except current user)
    if (email || phoneNumber || userId) {
      const existingUser = await DeliveryBoyModel.findOne({
        $or: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null,
          userId ? { userId } : null,
        ].filter(Boolean), // Remove `null` values
        _id: { $ne: id }, // Exclude current user
      });

      if (existingUser) {
        let message = "Delivery boy with this ";
        if (existingUser.email === email) message += "email ";
        else if (existingUser.phoneNumber === phoneNumber)
          message += "phone number ";
        else if (existingUser.userId === userId) message += "userId ";
        message += "already exists.";

        return res.status(400).json({ success: false, message });
      }
    }

    // If password is provided, hash it
    let hashedPassword = deliveryBoy.password; // Keep existing password if not updated
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update the fields dynamically
    Object.assign(deliveryBoy, {
      fullName: fullName || deliveryBoy.fullName,
      email: email || deliveryBoy.email,
      phoneNumber: phoneNumber || deliveryBoy.phoneNumber,
      userId: userId || deliveryBoy.userId,
      password: password || deliveryBoy.password,
      address: address || deliveryBoy.address,
      branch: branch || deliveryBoy.branch,
      image: image || deliveryBoy.image,
    });

    await deliveryBoy.save();
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

    const deliveryBoy = await DeliveryBoyModel.findByIdAndDelete(id);

    if (!deliveryBoy) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery boy not found." });
    }

    res
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
