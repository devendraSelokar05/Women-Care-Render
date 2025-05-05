const BrandModel=require("../../models/UserModels/brand")
const ProductModel=require("../../models/SuperAdminModels/Product")

//✅ create Brand
const createBrand = async(req, res)=>{
    try {
        const {brandName}=req.body
        const image=req.file.path
        if(!brandName || !image){
            return res.status(400).json({
                success:false,
                message:"Brand name and image are required"
            })
        }
        const newBrand=await BrandModel.create({
            brandName,
            image
        })
        return res.status(201).json({
            success:true,
            message:"Brand created successfully",
            data:newBrand
        })
    } catch (error) {
       return  res.status(500).json({
            success:false,
            message:"Error creating brand",
            error:error.message
        })
    }
}


//✅ get All Brands
const getAllBrands = async(req, res)=>{
    try {
        const brands=await BrandModel.find();
        return res.status(200).json({
            success:true,
            message:"Brands fetched successfully",
            data:brands
        })
    } catch (error) {
       return  res.status(500).json({
            success:false,
            message:"Error fetching brands",
            error:error.message
        })
    }
}

const getProductsByBrand = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const { id } = req.params;

    // Find brand by ID
    const Brand = await BrandModel.findById(id);
    if (!Brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const skip = (page - 1) * limit;

    // Total number of products for this brand
    const totalProducts = await ProductModel.countDocuments({ brand: Brand.brandName });
    const totalPages = Math.ceil(totalProducts / limit);
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    // Paginated product fetch
    const products = await ProductModel.find({ brand: Brand.brandName })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Products According To Brand fetched successfully",
      currentPage: page,
      totalPages,
      totalProducts,
      hasPrevious,
      hasNext,
      data: products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};


//✅ update brand
const updateBrand = async (req, res) => {
    try {
      const { brandName } = req.body;
      const image = req.file?.path; // safe access
  
      const brand = await BrandModel.findById(req.params.id);
  
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }
  
      // Update fields conditionally
      brand.brandName = brandName || brand.brandName;
      brand.image = image || brand.image;
  
      await brand.save(); // save updated brand
  
      return res.status(200).json({
        success: true,
        message: "Brand updated successfully",
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating brand",
        error: error.message,
      });
    }
  };
  

//✅ delete brand
const deleteBrand = async (req, res) => {
    try {
      const brand = await BrandModel.findByIdAndDelete(req.params.id);
  
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Brand deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting brand",
        error: error.message,
      });
    }
  };

module.exports={
    createBrand,
    getAllBrands,
    getProductsByBrand,
    updateBrand,
    deleteBrand
}