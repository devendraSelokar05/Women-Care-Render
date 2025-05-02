const express = require("express");
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");

const {
    addReview,
    getAllReviews,
    getAverageRatings,
    getAllReviewsById,
} = require("../../controllers/UserControllers/reviewController");
 
const router = express.Router();
 
//✅ User Review Routes
router.post(
    "/addReview/:productId",
    userValidateToken,

    addReview
);
 
router.get("/getAllReviews", getAllReviews);
router.get("/getAllReviewsById/:productId", getAllReviewsById);
router.get("/getAverageRatings/:productId", getAverageRatings);
 
module.exports = router;