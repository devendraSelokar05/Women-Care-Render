const Banner = require("../../models/SuperAdminModels/banner");
const { cloudinary } = require("../../config/cloudinary");

//✅ Add Banner
const addBanner = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required.",
      });
    }

    // 🛑 Check if already 5 banners exist
    const bannerCount = await Banner.countDocuments();
    if (bannerCount >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 banners are allowed. Cannot add more banners.",
      });
    }

    const image = req.file.path; // ✅ Store single image path

    // 🔢 Generate next Banner No.
    const lastBanner = await Banner.findOne().sort({ createdAt: -1 });
    let nextBannerNo = "Banner No.1";

    if (lastBanner && lastBanner.bannerNo) {
      const lastNumber =
        parseInt(lastBanner.bannerNo.replace("Banner No.", "")) || 0;
      const newNumber = lastNumber + 1;
      nextBannerNo = `Banner No.${newNumber}`;
    }

    const newBanner = new Banner({
      title,
      description,
      image, // ✅ Single image URL
      bannerNo: nextBannerNo,
    });

    await newBanner.save();

    res.status(201).json({
      success: true,
      message: "Banner added successfully.",
      data: newBanner,
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};



//✅ Get all banners
const getAllBanners = async (req, res) => {
  try {
    const {
      query = "",
      sort = "asc",          
      sortBy = "createdAt",  
      page = 1,
      limit = 10
    } = req.query;

    // Case-insensitive search
    const filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };

    const sortOrder = sort === "desc" ? -1 : 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalBanners = await Banner.countDocuments(filter);
    const totalPages = Math.ceil(totalBanners / limit);

    const banners = await Banner.find(filter)
      .sort({ [sortBy]: sortOrder })                    // Dynamic sort
      .collation({ locale: "en", strength: 2 })         // Case-insensitive
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalBanners,
      totalPages,
      currentPage: parseInt(page),
      banners,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//✅ Get Banner by ID
const getBannerById = async(req, res) =>{
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }
    res.status(200).json({
      success: true,
      banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//✅ Update Banner with Cloudinary Image Upload
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    // Build update data object
    let updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    // If new image is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Women_Care_Banners",
      });
      updateData.image = result.secure_url; // Replace old image
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: updatedBanner,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  addBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
