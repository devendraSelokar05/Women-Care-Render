const Banner = require("../../models/SuperAdminModels/banner");


//✅ Get All Banners
const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({});

    
     return res.status(200).json({
        success: true,
        message: "All Banner fetched successfully",
        banners
    });
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching banner",
            error: error.message
        });
    }
};

module.exports = { getAllBanners };
