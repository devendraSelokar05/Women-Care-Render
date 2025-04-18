const jwt = require("jsonwebtoken");
const userModel = require("../models/UserModels/User");

const userValidateToken = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || req.header("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded); // ✅ Check what's inside

        const user = await userModel.findById(decoded.id);
        if (!user) {
            // console.log("User not found with id:", decoded.id); // ✅ Helpful log
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token has expired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { userValidateToken };
