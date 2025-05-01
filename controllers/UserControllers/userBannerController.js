const Banner = require("../../models/SuperAdminModels/banner");


//✅ Get Single Banner using banner number
const getSingleBanner = async (req, res) => {
    const bannerIndex = Number(req.query.number);

    if (!Number.isInteger(bannerIndex) || bannerIndex < 1 || bannerIndex > 5) {
        return res
            .status(400)
            .json({ message: "Banner number must be an integer between 1 and 5." });
    }

    try {
        const banner = await Banner.findOne({
            bannerNo: `Banner No.${bannerIndex}`,
        });

        if (!banner) {
            return res.status(404).json({ message: "Banner not found." });
        }

        res.status(200).json(banner);
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getSingleBanner };
