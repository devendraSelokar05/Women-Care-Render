const jwt = require("jsonwebtoken");
const DeliveryBoy =  require("../models/SuperAdminModels/DeliveryBoy")
 
const deliveryBoyAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }
 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const deliveryBoy = await DeliveryBoy.findById(decoded.id);
        if (!deliveryBoy) {
            return res.status(401).json({ message: "Authorization denied. Delivery boy not found." });
        }
 
        req.deliveryBoy = deliveryBoy;
        next();
    } catch (error) {
        console.error("Error in delivery boy authentication middleware:", error);
        res.status(401).json({ message: "Token is not valid. Authorization denied." });
    }
};
 
module.exports = deliveryBoyAuthMiddleware;