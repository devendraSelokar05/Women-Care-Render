const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdminModels/SuperAdmin');
 
const superAdminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from the request header
        const token = req.headers.authorization?.split(" ")[1]; // Authorization: Bearer <token>
        
        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }
 
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
        // Find admin by ID stored in the token
        const admin = await SuperAdmin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: "Authorization denied. Admin not found." });
        }
 
        // Attach the admin object to the request object
        req.admin = admin;
        next(); // Pass control to the next middleware or controller
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
 
module.exports = superAdminAuthMiddleware;
 