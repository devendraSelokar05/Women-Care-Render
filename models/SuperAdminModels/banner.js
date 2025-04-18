const mongoose = require("mongoose");
 
const BannerSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Offer Banner", "Discount"],
      required: true,
    },
    images: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["Published", "Not Published"],
      default: "Not Published",
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Banner", BannerSchema);