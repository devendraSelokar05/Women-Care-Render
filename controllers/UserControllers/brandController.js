const BrandModel=require("../../models/UserModels/brand")


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
        const brands=await BrandModel.find().select("-_id");
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
    updateBrand,
    deleteBrand
}