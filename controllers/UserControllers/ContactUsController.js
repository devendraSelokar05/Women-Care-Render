const ContactUs = require("../../models/UserModels/Contact-Us");
 
//✅ Create Contact Us
const createContactUs = async (req, res) => {
  try {
    const { title, phoneNumber } = req.body;
 
    if (!title || !phoneNumber) {
      return res.status(400).json({ message: "Both title and phone number are required" });
    }
 
    const contactUs = new ContactUs({ title, phoneNumber });
    await contactUs.save();
 
    res.status(200).json({ message: "Contact Us form submitted successfully", contactUs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
 
//✅ Get Contact Us
const getContactUs = async (req, res) => {
  try {
    const contactUsList = await ContactUs.findOne();
    res.status(200).json(contactUsList);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
 
module.exports = {
  createContactUs,
  getContactUs,
};