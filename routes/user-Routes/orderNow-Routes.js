const express = require("express");
const router = express.Router();
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { confirmOrder, cancelOrder, getUserOrders, getViewOrderDetails, getOrderById,  trackOrder } = require("../../controllers/UserControllers/orderNowController");


//✅ User Order Routes
router.get("/details/:orderId", userValidateToken, getOrderById);
router.get("/orders", userValidateToken, getUserOrders);
router.get("/viewOrder/:orderId", userValidateToken, getViewOrderDetails);

//✅ User Order Status
router.put("/confirm/:orderId", userValidateToken, confirmOrder);
router.put("/cancel/:orderId", userValidateToken, cancelOrder);


//✅ Tracker
router.get("/track/:id", trackOrder);


module.exports = router;
