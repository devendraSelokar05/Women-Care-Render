const Testimonial = require("../../models/SuperAdminModels/Testimonial");

//✅ Create Testimonial
const createTestimonial = async (req, res) => {
  try {
    const { name, subtitle, feedback, status } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required.",
      });
    }
    const image = req.file.path;
    // console.log("string:",image);

    const newTestimonial = await Testimonial.create({
      name,
      subtitle,
      image,
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
    let { page = 1, limit = 10, search, sortOrder = "asc" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Build search query
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { feedback: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    // Fetch filtered & paginated testimonials
    const [testimonials, totalCount] = await Promise.all([
      Testimonial.find(query)
        .sort({ name: sortDirection })
        .skip(skip)
        .limit(limit)
        .select("image name feedback"),
      Testimonial.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      totalTestimonials: totalCount,
      totalPages,
      currentPage: page,
      previous: page > 1,
      next: page < totalPages,
      testimonials,
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

    const image = req.file.path;

    // Fetch existing testimonial
    const existingTestimonial = await Testimonial.findById(req.params.id);
    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name,
        subtitle,
        image,
        feedback,
        status,
      },
      { new: true, runValidators: true }
    );

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
