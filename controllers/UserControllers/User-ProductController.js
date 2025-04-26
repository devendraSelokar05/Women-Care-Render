const ProductModel = require("../../models/SuperAdminModels/Product");
 
//✅ Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find(
            {},
            "image productName price quantityInEachPack"
        );
 
        // Extract only the first image from the image array
        const formattedProducts = products.map((product) => ({
            _id: product._id,
            image: product.image.length > 0 ? product.image[0] : null, // Return first image or null
            productName: product.productName,
            price: product.price,
            quantityInEachPack: product.quantityInEachPack,
        }));
 
        res.status(200).json({
            success: true,
            totalProducts: formattedProducts.length,
            products: formattedProducts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
 
//✅ Get Product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
 
        const product = await ProductModel.findById(
            id,
            "_id image productName quantityInEachPack price availableProductQuantity productDescription"
        );
 
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }
 
        // Extract first image and remaining images as relatedImages
        const formattedProduct = {
            _id: product._id,
            image: product.image.length > 0 ? product.image[0] : null, // First image
            productName: product.productName,
            quantityInEachPack: product.quantityInEachPack,
            price: product.price,
            aboutThisItem: product.productDescription, // Renaming productDescription to aboutThisItem
            relatedImages: product.image.length > 1 ? product.image.slice(1) : [], // Remaining images as relatedImages
        };
 
        // Show leftStock only if 20 or less
        if (product.availableProductQuantity <= 20) {
            formattedProduct.leftStock = product.availableProductQuantity;
        }
 
        res.status(200).json({ success: true, product: formattedProduct });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ success: false, message: "Error fetching product", error });
    }
};
 
module.exports = { getAllProducts, getProductById };
 