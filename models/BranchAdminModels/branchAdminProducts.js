const { Schema, model } = require("mongoose");
 
const branchProductSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Products",
            required: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branches",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be negative"],
        },
    },
    { timestamps: true }
);
 
const BranchAdminProductModel = model(
    "BranchProduct",
    branchProductSchema
);
module.exports = BranchAdminProductModel;
 