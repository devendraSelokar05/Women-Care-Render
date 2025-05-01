const mongoose = require("mongoose");
 
const ContactUsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, 
    phoneNumber: { type: String, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactUs", ContactUsSchema);