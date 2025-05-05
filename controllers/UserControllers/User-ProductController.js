const ProductModel = require("../../models/SuperAdminModels/Product");
const reviewModel = require("../../models/UserModels/Review");
const OrderModel = require("../../models/UserModels/orderNow");
const mongoose = require("mongoose");

//✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    const { brand } = req.query;

    const allowedBrands = [
      "whisper",
      "Stayfree",
      "Sofy",
      "always",
      "natracare",
    ];

    // Check if brand is provided and is valid
    if (brand && !allowedBrands.includes(brand)) {
      return res.status(400).json({
        success: false,
        message: `The brand '${brand}' is not valid. Please use one of the following valid brands: ${allowedBrands.join(
          ", "
        )}.`,
      });
    }

    const filter = brand ? { brand } : {};

    const products = await ProductModel.find(
      filter,
      "image productName price quantityInEachPack brand size"
    );

    const formattedProducts = products.map((product) => ({
      _id: product._id,
      image: product.image.length > 0 ? product.image[0] : null,
      productName: product.productName,
      price: product.price,
      quantityInEachPack: product.quantityInEachPack,
      brand: product.brand,
      size: product.size,
    }));

    res.status(200).json({
      success: true,
      totalProducts: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//✅ Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    // Generate "Free Delivery Monday," style text
    const getDeliveryText = (date) => {
      if (!date) return null;
      const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      return `${day}`;
    };

    const [product, ratingData, orderData] = await Promise.all([
      ProductModel.findById(id, "_id image productName quantityInEachPack price availableProductQuantity productDescription size"),
      reviewModel.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$ratings" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
      OrderModel.findOne({ "items.product": id }, "deliveryDate").sort({ deliveryDate: -1 })
    ]);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const firstImage = product.image?.[0] || null;
    const relatedImages = product.image?.slice(1) || [];
    const { averageRating = null, totalReviews = 0 } = ratingData[0] || {};
    const formattedDeliveryDate = formatDate(orderData?.deliveryDate);
    const deliveryText = getDeliveryText(orderData?.deliveryDate);

    const formattedProduct = {
      _id: product._id,
      image: firstImage,
      relatedImages,
      productName: product.productName,
      quantityInEachPack: product.quantityInEachPack,
      size: product.size,
      price: product.price,
      aboutThisItem: product.productDescription,
      deliveryDate: formattedDeliveryDate,  
      deliveryText,                          
      averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : 0,
      totalReviews,
      ...(product.availableProductQuantity <= 20 && { leftStock: product.availableProductQuantity })
    };

    res.status(200).json({ success: true, product: formattedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching product", error });
  }
};



//✅ Get Buy It With
const getBuyItWith = async (req, res) => {
  try {
    const { productId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [products, total] = await Promise.all([
      ProductModel.find({ _id: { $ne: productId }, brand: product.brand })
        .select("image productName quantityInEachPack price size")
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments({ _id: { $ne: productId }, brand: product.brand }),
    ]);

    const formattedProducts = products.map((prod) => ({
      ...prod._doc,
      image: Array.isArray(prod.image) ? prod.image[0] : prod.image,
    }));

    return res.status(200).json({
      success: true,
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      previous: page > 1,
      next: page < Math.ceil(total / limit),
      buyItWith: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get Related Products
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [products, total] = await Promise.all([
      ProductModel.find({ _id: { $ne: productId }, size: product.size })
        .select("image productName quantityInEachPack price size")
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments({ _id: { $ne: productId }, size: product.size }),
    ]);

    const formattedProducts = products.map((prod) => ({
      ...prod._doc,
      image: Array.isArray(prod.image) ? prod.image[0] : prod.image,
    }));

    return res.status(200).json({
      success: true,
      totalCustomers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      previous: page > 1,
      next: page < Math.ceil(total / limit),
      relatedProducts: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  getBuyItWith,
  getRelatedProducts,
};
