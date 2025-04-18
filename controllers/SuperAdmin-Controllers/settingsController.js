const Settings = require("../../models/SuperAdminModels/Settings");



//✅ Create Settings
const createSettings = async (req, res) => {
  try {
    const {
      emergencyDeliveryFee = 0,
      settingType,
      termsAndConditions = [],
      privacyPolicy = [],
      aboutUs = [],
      referAndEarn = [],
    } = req.body;

    if (!settingType?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Setting type is required",
      });
    }

    // Ensure descriptions are arrays of strings
    const formatDescription = (input) => {
      if (Array.isArray(input)) return input; // Already an array of strings
      if (typeof input === "string") return [input]; // Convert single string to array
      if (typeof input === "object" && input?.description)
        return input.description; // Extract array from object
      return []; // Default to empty array if none of the above match
    };

    const newSettings = new Settings({
      emergencyDeliveryFee,
      settingType,
      termsAndConditions: {
        description: formatDescription(termsAndConditions),
      },
      privacyPolicy: { description: formatDescription(privacyPolicy) },
      aboutUs: { description: formatDescription(aboutUs) },
      referAndEarn: { description: formatDescription(referAndEarn) },
    });

    await newSettings.save();

    return res.status(201).json({
      success: true,
      message: "Settings created successfully",
      settings: newSettings,
    });
  } catch (error) {
    console.error("Error creating settings:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create settings. Please try again later.",
      error: error.message,
    });
  }
};

//✅ Get Settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    res.status(200).json(settings || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//✅ Update Emergency Delivery Fee and Setting Type
const updateEmergencyDeliveryFeeAndSettingType = async (req, res) => {
  try {
    const { fee, type } = req.body;

    if (fee === undefined)
      return res
        .status(400)
        .json({ message: "Emergency Delivery Fee is required" });
    if (!type)
      return res.status(400).json({ message: "Setting Type is required" });

    const settings = await Settings.findOneAndUpdate(
      {},
      { emergencyDeliveryFee: fee, settingType: type },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Emergency Delivery Fee and Setting Type is updated",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//✅ Edit Terms and Conditions
const editTermsAndConditions = async (req, res) => {
  try {
    const { termsAndConditions } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: { "termsAndConditions.description": termsAndConditions } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Terms & Conditions updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating Terms & Conditions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//✅ Edit Privacy Policy
const editPrivacyPolicy = async (req, res) => {
  try {
    const { privacyPolicy } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: { "privacyPolicy.description": privacyPolicy } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Privacy Policy updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating Privacy Policy:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

//✅ Update About Us
const updateAboutUs = async (req, res) => {
  try {
    const { description } = req.body;
    let updateData = {};

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    if (images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    if (description) updateData["aboutUs.description"] = description;
    if (images.length > 0) updateData["aboutUs.images"] = images;

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ message: "About Us updated successfully", settings });
  } catch (error) {
    console.error("Error in updateAboutUs:", error);
    res.status(500).json({ message: error.message });
  }
};

//✅ Update Refer and Earn
const updateReferAndEarn = async (req, res) => {
  try {
    const { description } = req.body;
    let updateData = {};

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    if (images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    if (description) updateData["referAndEarn.description"] = description;
    if (images.length > 0) updateData["referAndEarn.images"] = images;

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json({ message: "Refer and Earn updated successfully", settings });
  } catch (error) {
    console.error("Error in updateReferAndEarn:", error);
    res.status(500).json({ message: error.message });
  }
};

//✅ Setting Type Dropdown
const settingTypeDropdown = async (req, res) => {
  try {
    const dropdownValue = ["Customer Website", "Mobile App", "Other"];

    res.json({ success: true, data: dropdownValue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSettings,
  updateEmergencyDeliveryFeeAndSettingType,
  getSettings,
  editTermsAndConditions,
  editPrivacyPolicy,
  updateAboutUs,
  updateReferAndEarn,
  settingTypeDropdown,
};
