const express = require('express');
const router = express.Router();
const {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
    getTestimonialStatus
} = require('../../controllers/SuperAdmin-Controllers/testimonialController');
const {upload} = require("../../config/cloudinary")
 
//✅ SuperAdmin Testimonial Routes
router.post('/createTestimonial', upload.single("image"), createTestimonial);
router.get('/getAllTestimonials', getAllTestimonials);
router.get('/getTestimonialById/:id', getTestimonialById);
router.put('/updateTestimonial/:id', upload.single("image"),updateTestimonial);
router.delete('/deleteTestimonial/:id', deleteTestimonial);
router.get('/getTestimonialStatus', getTestimonialStatus);
 
module.exports = router;