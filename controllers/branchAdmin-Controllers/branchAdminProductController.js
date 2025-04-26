const BranchAdminProductModel = require("../../models/BranchAdminModels/branchAdminProducts");
const ProductModel = require("../../models/SuperAdminModels/Product");
const mongoose = require("mongoose");

 
//✅ Get all products with pagination
const getAllProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "" } = req.query;
 
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));
        search = search.trim();
 
        const searchRegex = new RegExp(search, "i"); // case-insensitive regex
 
        // Aggregation pipeline
        const pipeline = [
            {
                $match: {
                    branch: new mongoose.Types.ObjectId(req.branchAdmin.branch),
                },
            },
            {
                $lookup: {
                    from: "products", // your collection name (make sure it's correct)
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: "$product",
            },
            {
                $match: {
                    $or: [
                        { "product.brand": searchRegex },
                        { "product.productName": searchRegex },
                        { "product.productSubType": searchRegex },
                    ],
                },
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: "$product._id",
                                image: { $arrayElemAt: ["$product.image", 0] },
                                productName: "$product.productName",
                                brand: "$product.brand",
                                availableProductQuantity: "$quantity",
                            },
                        },
                    ],
                },
            },
        ];
 
        const result = await BranchAdminProductModel.aggregate(pipeline);
        const metadata = result[0].metadata[0] || { total: 0 };
        const totalProducts = metadata.total;
        const totalPages = Math.ceil(totalProducts / limit);
 
        res.status(200).json({
            success: true,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: page,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages,
            },
            products: result[0].data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
 
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product ID." });
        }
 
        const product = await ProductModel.findById(id)
            .select(
                "productName image brand size quantityInEachPack productCode productSubType productDescription"
            )
            .lean();
 
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }
 
        const formattedProduct = {
            id: product._id,
            productName: product.productName,
            image: product.image || null,
            brandName: product.brand,
            size: product.size,
            quantityInEachPack: product.quantityInEachPack,
            productCode: product.productCode,
            subType: product.productSubType,
            productDescription: product.productDescription,
        };
 
        return res.status(200).json({ success: true, product: formattedProduct });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
module.exports = { getAllProducts, getProductById };
 