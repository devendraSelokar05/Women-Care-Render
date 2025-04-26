const ProductModel = require("../../models/SuperAdminModels/Product");
const BranchModel = require("../../models/SuperAdminModels/branch");
const BranchAdminProductModel = require("../../models/BranchAdminModels/branchAdminProducts");
const mongoose = require("mongoose");

const capitalizeWords = (str) => {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

//✅ Create Products
const createProduct = async (req, res) => {
  try {
    const {
      brand,
      productName,
      productSubType,
      productDescription,
      size,
      price,
      quantityInEachPack,
      availableProductQuantity,
    } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path);
    }

    // Capitalize first letter of each word in productName
    const formattedProductName = capitalizeWords(productName);

    // Fetch enum values for the 'brand' field from the ProductModel schema
    const validBrands = ProductModel.schema.path('brand').enumValues;

    // Check if brand is a valid enum value (dynamically fetched from schema)
    if (!validBrands.includes(brand)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid brand value. Allowed values are: ${validBrands.join(
            ", "
          )}`,
        });
    }

    // Find last valid product with proper productCode
    const lastProduct = await ProductModel.findOne({
      productCode: { $regex: /^PR\d{4}$/ },
    }).sort({ productCode: -1 });

    // Generate new productCode
    const newProductCode = lastProduct
      ? `PR${(parseInt(lastProduct.productCode.slice(2)) + 1)
        .toString()
        .padStart(4, "0")}`
      : "PR0001";

    const newProduct = new ProductModel({
      productCode: newProductCode,
      brand,
      productName: formattedProductName, // Use the formatted product name
      productSubType,
      productDescription,
      size,
      price,
      quantityInEachPack,
      image: imagePaths,
      availableProductQuantity,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sortOrder = "" } = req.query; // Default: page 1, limit 10, empty search query
    page = parseInt(page);
    limit = parseInt(limit);

    // Create a search filter
    const searchFilter = {
      $or: [
        { brand: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { productSubType: { $regex: search, $options: "i" } },
      ],
    };

    const [totalProducts, products] = await Promise.all([
      ProductModel.countDocuments(searchFilter),
      ProductModel.find(searchFilter)
        .select("image productName availableProductQuantity")
        .sort(
          sortOrder === "asc"
            ? { productName: 1 }
            : sortOrder === "desc"
              ? { productName: -1 }
              : {}
        )
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const formattedProduct = products.map((product) => ({
      id: product._id,
      image: product.image[0],
      productName: product.productName,
      availableProductQuantity: product.availableProductQuantity,
    }));

    const totalPages = Math.ceil(totalProducts / limit);
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages,
      currentPage: page,
      previous: hasPrevious,
      next: hasNext,
      products: formattedProduct,
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

    const product = await ProductModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching product", error });
  }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { existingImages, brand } = req.body;

    let images = [];
    if (Array.isArray(existingImages)) {
      images = [...existingImages];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
    }

    // Fetch enum values for the 'brand' field from the ProductModel schema
    const validBrands = ProductModel.schema.path('brand').enumValues;

    // Check if brand is a valid enum value (dynamically fetched from schema)
    if (!validBrands.includes(brand)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid brand value. Allowed values are: ${validBrands.join(
            ", "
          )}`,
        });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
        image: images,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ add product quantity
const addProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    if (quantity === undefined || quantity === null) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity is missing." });
    }

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    product.availableProductQuantity += quantity;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product quantity updated successfully!",
      updatedQuantity: product.availableProductQuantity,
    });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating product quantity.",
      error: error.message,
    });
  }
};

// ✅ remove product quantity
const removeProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Validate quantity
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is missing.",
      });
    }

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    // Fetch product
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check if quantity is enough
    if (product.availableProductQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove ${quantity} items. Only ${product.availableProductQuantity} available.`,
      });
    }

    // Subtract quantity
    product.availableProductQuantity -= quantity;
    await product.save();

    let message = "Product quantity updated successfully!";
    if (product.availableProductQuantity === 0) {
      message += " Product is now out of stock.";
    }

    return res.status(200).json({
      success: true,
      message,
      updatedQuantity: product.availableProductQuantity,
    });
  } catch (error) {
    console.error("Error removing product quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating product quantity.",
      error: error.message,
    });
  }
};

//✅ Get Available Product Quantity
const getAvailableProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    const product = await ProductModel.findById(id).select(
      "availableProductQuantity"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      availableProductQuantity: product.availableProductQuantity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get available quantity of branch product
const getBranchAvailableProductQuantity = async (req, res) => {
  try {
    const { branchId, productId } = req.query;

    // Validate presence and format
    if (!branchId || !productId) {
      return res.status(400).json({
        success: false,
        message: "branchId and productId are required.",
      });
    }

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId(branchId) || !isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branchId or productId format.",
      });
    }

    // Fetch quantity from BranchAdminProductModel
    const product = await BranchAdminProductModel.findOne({
      branch: branchId,
      product: productId,
    }).select("quantity");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      availableQuantity: product.quantity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//✅ Branch Dropdown
const getAllBranches = async (req, res) => {
  try {
    const branch = await BranchModel.find({}).select("branchName");
    res.status(200).json({ success: true, branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Assign Product to Branch
const assignToBranch = async (req, res) => {
  try {
    const assignments = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array.",
      });
    }

    // All entries must share the same productId
    const { productId } = assignments[0];
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing productId.",
      });
    }

    // Validate all entries and sum total quantity
    let totalQuantityToAdd = 0;
    for (const assignment of assignments) {
      const { quantityToAdd, branchId } = assignment;

      if (!quantityToAdd || !branchId) {
        return res.status(400).json({
          success: false,
          message: "Each object must have quantityToAdd and branchId.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid branch ID found in one of the object.",
        });
      }

      totalQuantityToAdd += quantityToAdd;
    }

    // Fetch product
    const product = await ProductModel.findById(productId).select(
      "availableProductQuantity"
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check stock
    if (product.availableProductQuantity < totalQuantityToAdd) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.availableProductQuantity} unit(s) available in stock. Please reduce the total quantity.`,
      });
    }

    // Update each branch's inventory
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    for (const { quantityToAdd, branchId } of assignments) {
      await BranchAdminProductModel.findOneAndUpdate(
        { product: productId, branch: branchId },
        { $inc: { quantity: quantityToAdd } },
        options
      );
    }

    // Update main product inventory
    product.availableProductQuantity -= totalQuantityToAdd;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Quantity updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete a product by ID
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting product", error });
  }
};

// ✅ get unique brands
const getBrands = async (req, res) => {
  try {
    const brands = ProductModel.schema.path("brand").enumValues;
    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get unique sizes
const getSizes = async (req, res) => {
  try {
    const sizes = ProductModel.schema.path("size").enumValues;
    res.status(200).json({ success: true, sizes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getAvailableProductQuantity,
  getAllBranches,
  assignToBranch,
  getBranchAvailableProductQuantity,
  deleteProductById,
  getBrands,
  getSizes,
  addProductQuantity,
  removeProductQuantity,
};
