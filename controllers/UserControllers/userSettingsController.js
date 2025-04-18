const Settings = require("../../models/SuperAdminModels/Settings");
 
//✅ Get About Us
const getAboutUs = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings || settings.length === 0) {
      res.status(404).json({ message: "No settings found" });
      return;
    }
    const aboutUs = settings[0].aboutUs;
    if (!aboutUs) {
      res.status(404).json({ message: "About Us not found" });
      return;
    }
    res.status(200).json({ aboutUs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
 
//✅ Get Privacy Policy
const getPrivacyPolicy = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings || settings.length === 0) {
      res.status(404).json({ message: "No settings found" });
      return;
    }
    const privacyPolicy = settings[0].privacyPolicy;
    if (!privacyPolicy) {
      res.status(404).json({ message: "Privacy Policy not found" });
      return;
    }
    res.status(200).json({ privacyPolicy });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
 
//✅ Get Terms and Conditions
const getTermsAndConditions = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings || settings.length === 0) {
      res.status(404).json({ message: "No settings found" });
      return;
    }
    const termsAndConditions = settings[0].termsAndConditions;
    if (!termsAndConditions) {
      res.status(404).json({ message: "Terms and Conditions not found" });
      return;
    }
    res.status(200).json({ termsAndConditions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
 
//✅ Get Refer and Earn
const getReferAndEarn = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings || settings.length === 0) {
      res.status(404).json({ message: "No settings found" });
      return;
    }
    const referAndEarn = settings[0].referAndEarn;
    if (!referAndEarn) {
      res.status(404).json({ message: "Refer and Earn not found" });
      return;
    }
    res.status(200).json({ referAndEarn });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
 
module.exports = {
  getAboutUs,
  getPrivacyPolicy,
  getTermsAndConditions,
  getReferAndEarn
};
 