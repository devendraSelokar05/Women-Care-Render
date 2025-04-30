const { Schema, model } = require("mongoose");
 
const reviewSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Products",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ratings: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: true,
        },
        files: {
            type: [String],
        },
        title: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);
 
const reviewModel = model("Review", reviewSchema);
module.exports = reviewModel;
 
 