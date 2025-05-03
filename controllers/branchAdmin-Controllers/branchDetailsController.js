const branchModel = require("../../models/SuperAdminModels/branch");
const mongoose = require("mongoose");

//✅ Get Branch Details
const getBranchDetails = async (req, res) => {
    try {
        const { branchId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(branchId)) {
            return res.status(400).json({ success: false, message: "Invalid Branch ID" });
        }

        const branch = await branchModel.findById(branchId);

        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }

        return res.status(200).json({
            success: true,
            branch: {
                BranchName: branch.branchName,
                BranchManagerName: branch.branchManagerName,
                Email: branch.email,
                Password: branch.password,
                PhoneNumber: branch.phoneNumber,
                Address: branch.fullAddress,
                ServicePinCode: branch.servicePinCode.join(", "),
            }
        });
    } catch (error) {
        console.error("Error fetching branch:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getBranchDetails };
