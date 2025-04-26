const mongoose = require("mongoose");
 
const ContactUsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    suggestions: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactUs", ContactUsSchema);