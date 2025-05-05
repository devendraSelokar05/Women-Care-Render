const {
  EmergencyFeeModel,
  TermsAndConditionsModel,
  PrivacyPolicyModel,
  AboutUsModel,
} = require("../../models/SuperAdminModels/Settings");


//✅ isEmpty Function
const isEmpty = (value) =>
  !value || (Array.isArray(value) && value.length === 0);
 
//✅ Create Emergency Fee
const createEmergencyFee = async (req, res) => {
  const { feeAmount } = req.body;
  if (!feeAmount || isNaN(feeAmount)) {
    return res.status(400).json({message: "feeAmount must be a number" });
  }
 
  try {
    const existing = await EmergencyFeeModel.findOne();
    if (existing)
      return res.status(400).json({ message: "Emergency Fee already exists" });
 
    const fee = await EmergencyFeeModel.create({ feeAmount });
   return res.status(201).json({
    success:true,
    message:"Emergency Fee created successfully",
    feeAmount:fee.feeAmount,
   });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Get Emergency Fee
const getEmergencyFee = async (req, res) => {
  try {
    const data = await EmergencyFeeModel.findOne();
    return res.status(200).json({
      success:true,
      message:"Emergency Fee fetched successfully",
      data
    });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Update Emergency Fee
const updateEmergencyFee = async (req, res) => {
  const { feeAmount } = req.body;
  if (!feeAmount || isNaN(feeAmount)) {
    return res.status(400).json({ message: "feeAmount must be a number" });
  }
 
  try {
    const updated = await EmergencyFeeModel.findOneAndUpdate(
      {},
      { feeAmount },
      { new: true }
    );
   return res.status(200).json({
    success:true,
    message:"Emergency Fee updated successfully",
    updated
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Create Terms and Conditions
const createTerms = async (req, res) => {
  const { description } = req.body;
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const exists = await TermsAndConditionsModel.findOne();
    if (exists) return res.status(400).json({ message: "Terms already exist" });
 
    const data = await TermsAndConditionsModel.create({ description });
   return res.status(201).json({
    success: true,
    message: "Terms and Conditions created successfully",
    data
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
    
 
//✅ Get Terms and Conditions
const getTerms = async (req, res) => {
  try {
    const data = await TermsAndConditionsModel.findOne();
   return res.status(200).json({
    success:true,
    message:"Terms and Conditions fetched successfully",
    data
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 

//✅ Update Terms and Conditions
const updateTerms = async (req, res) => {
  const { description } = req.body;
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const updated = await TermsAndConditionsModel.findOneAndUpdate(
      {},
      { description },
      { new: true }
    );
   return res.status(200).json({
    success: true,
    message: "Terms and Conditions updated successfully",
    updated
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 

//✅ Create Privacy Policy
const createPrivacy = async (req, res) => {
  const { description } = req.body;
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const exists = await PrivacyPolicyModel.findOne();
    if (exists)
      return res.status(400).json({ message: "Privacy policy already exists" });
 
    const data = await PrivacyPolicyModel.create({ description });
   return  res.status(201).json({
    success:true,
    message:"Privacy policy created successfully",
    data
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Get Privacy Policy
const getPrivacy = async (req, res) => {
  try {
    const data = await PrivacyPolicyModel.findOne();
   return res.status(200).json({
      success:true,
      message:"Privacy policy fetched successfully",
      data
    });
  } catch (err) {
   return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Update Privacy Policy
const updatePrivacy = async (req, res) => {
  const { description } = req.body;
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const updated = await PrivacyPolicyModel.findOneAndUpdate(
      {},
      { description },
      { new: true }
    );
   return res.status(200).json({
    success: true,
    message: "Privacy policy updated successfully",
    updated
  });
  } catch (err) {
    return res.status(500).json({ success:false, error: err.message });
  }
};



//✅ Create About Us
const createAboutUs = async (req, res) => {
  const { description } = req.body;
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.path);
  }
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const exists = await AboutUsModel.findOne();
    if (exists)
      return res.status(400).json({ error: "About Us already exists" });
 
    const data = await AboutUsModel.create({ description, images });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Get About Us
const getAboutUs = async (req, res) => {
  try {
    const data = await AboutUsModel.findOne();
   return res.status(200).json({
    success:true,
    message:"About Us fetched successfully",
    data
  });
  } catch (err) {
   return res.status(500).json({ success:false, error: err.message });
  }
};
 
//✅ Update About Us
const updateAboutUs = async (req, res) => {
  const { existingImages, description } = req.body;
 
  // Combine existing and new image paths
  let images = [];
  if (Array.isArray(existingImages)) {
    images = [...existingImages];
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.path);
    images = [...images, ...newImages];
  }
  if (isEmpty(description)) {
    return res.status(400).json({ message: "Description is required" });
  }
 
  try {
    const updated = await AboutUsModel.findOneAndUpdate(
      {},
      { description, images },
      { new: true }
    );
   return res.status(200).json({
    success:true,
    message:"About Us updated successfully",
    updated
  });
  } catch (err) {
   return res.status(500).json({ success:false, error: err.message });
  }
};

 
 
module.exports = {
  createEmergencyFee,
  getEmergencyFee,
  updateEmergencyFee,
  createTerms,
  getTerms,
  updateTerms,
  createPrivacy,
  getPrivacy,
  updatePrivacy,
  createAboutUs,
  getAboutUs,
  updateAboutUs,
};