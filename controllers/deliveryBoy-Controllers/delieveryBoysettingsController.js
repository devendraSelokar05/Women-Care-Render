const deliverySettings = require("../../models/SuperAdminModels/Settings")

//✅ Get Trems And Condition
const getDeliveryBoyTermsandCondition = async (req, res) => {
    try {
      const settings = await deliverySettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.status(200).json({
        termsAndConditions: settings.termsAndConditions.description,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports = {getDeliveryBoyTermsandCondition}