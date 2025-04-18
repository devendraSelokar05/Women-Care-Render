const jwt = require("jsonwebtoken");
const BranchAdmin = require("../models/BranchAdminModels/branchAdmin");
 
const branchAdminAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from the request header
    const token = req.headers.authorization?.split(" ")[1]; // Authorization: Bearer <token>
 
    if (!token) {
      return res.status(401).json({ message: "No token provided. Authorization denied." });
    }
 
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // Find branch admin by ID stored in the token
    const branchAdmin = await BranchAdmin.findById(decoded.id);
    if (!branchAdmin) {
      return res.status(401).json({ message: "Authorization denied. Admin not found." });
    }
 
    // Attach the branch admin object to the request object
    req.branchAdmin = branchAdmin;
    next(); // Pass control to the next middleware or controller
  } catch (error) {
    console.error("Error in branch admin authentication middleware:", error);
    res.status(401).json({ message: "Token is not valid. Authorization denied." });
  }
};
 
module.exports = branchAdminAuthMiddleware;
 
 