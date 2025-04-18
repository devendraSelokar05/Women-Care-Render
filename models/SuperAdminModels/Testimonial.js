const mongoose = require('mongoose');
 
const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    image: {
        type: [String],
        required: true
    },
    feedback: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["published","unpublished"], 
        required: true
    }
}, { timestamps: true });
 
module.exports = mongoose.model('Testimonial', testimonialSchema);
 