const{Schema,model}=require("mongoose")

const brandSchema=new Schema({
    brandName:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    }
})

const BrandModel=model("Brand",brandSchema)
module.exports=BrandModel
