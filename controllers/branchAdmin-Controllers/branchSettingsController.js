const Settings = require("../../models/SuperAdminModels/Settings");
 

//✅ Get Settings
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Settings not found" });
    }
    const filteredResponse = {
      termsAndConditions: settings.termsAndConditions,
      privacyPolicy: settings.privacyPolicy,
      aboutUs:{
        description:settings.aboutUs?.description
      },
     
   
      referAndEarn:{
        description:settings.referAndEarn?.description
      }
    };
    res.status(200).json(filteredResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {  
  getSettings,
};
