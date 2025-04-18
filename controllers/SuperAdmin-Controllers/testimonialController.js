const Testimonial = require("../../models/SuperAdminModels/Testimonial");

//✅ Create Testimonial
const createTestimonial = async (req, res) => {
  try {
    const { name, subtitle, feedback, status } = req.body;
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path);
    }

    const newTestimonial = await Testimonial.create({
      name,
      subtitle,
      image: imagePaths,
      feedback,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: newTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating testimonial",
      error: error.message,
    });
  }
};

//✅ Get all testimonials
const getAllTestimonials = async (req, res) => {
  try {
    let { page, limit, search, sortBy, sortOrder } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    //Implemented Sort
    sortBy = sortBy || "name"; // Default sorting by name
    sortOrder = sortOrder === "desc" ? -1 : 1;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { subtitle: { $regex: search, $options: "i" } },
          { feedback: { $regex: search, $options: "i" } },
        ],
      };
    }

    const testimonials = await Testimonial.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalCount = await Testimonial.countDocuments(query);

    res.status(200).json({
      success: true,
      data: testimonials,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
      error: error.message,
    });
  }
};

//✅ Get a single testimonial by ID
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching testimonial",
      error: error.message,
    });
  }
};

//✅ Update a testimonial by ID
const updateTestimonial = async (req, res) => {
  try {
    const { name, subtitle, feedback, status } = req.body;
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path);
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name,
        subtitle,
        image: imagePaths.length > 0 ? imagePaths : undefined,
        feedback,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating testimonial",
      error: error.message,
    });
  }
};

//✅ Delete a testimonial by ID
const deleteTestimonial = async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting testimonial",
      error: error.message,
    });
  }
};

//✅ Dropdown Api For Status
const getTestimonialStatus = async (req, res) => {
  try {
    const statuses = ["published", "unpublished"];
    res.status(200).json({
      success: true,
      statuses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statuses",
      error: error.message,
    });
  }
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStatus,
};
