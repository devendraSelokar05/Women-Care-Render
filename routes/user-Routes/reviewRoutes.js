const express = require("express");
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { upload } = require("../../config/cloudinary");
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
    upload.array("files", 5),
    addReview
);
 
router.get("/getAllReviews", getAllReviews);
router.get("/getAllReviewsById/:productId", getAllReviewsById);
router.get("/getAverageRatings/:productId", getAverageRatings);
 
module.exports = router;