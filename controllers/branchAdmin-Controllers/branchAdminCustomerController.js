const userModel = require("../../models/UserModels/User");
const branchModel = require("../../models/SuperAdminModels/branch");
const Order = require("../../models/UserModels/orderNow");
const mongoose = require("mongoose");

//✅ Get All Customers
const getAllCustomers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sortOrder = "asc" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const branchId = req.branchAdmin?.branch;
    if (!branchId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to branch data.",
      });
    }

    // Get service pin codes for the branch
    const branchInfo = await branchModel.findById(branchId).select("servicePinCode");
    const servicePincodes = branchInfo?.servicePinCode || [];

    // If no pincodes, no customer is served
    if (servicePincodes.length === 0) {
      return res.status(200).json({
        success: true,
        totalCustomers: 0,
        customers: [],
      });
    }

    // Construct query
    const query = {
      address: { $regex: `(${servicePincodes.join("|")})`, $options: "i" },
    };

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ];

      const phoneSearch = Number(search);
      if (!isNaN(phoneSearch)) {
        query.$or.push({ phoneNumber: phoneSearch });
      }
    }

    // Total customers count
    const totalCustomers = await userModel.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limit);
    const skip = (page - 1) * limit;

    // Determine sorting
    const sort =
      sortOrder.toLowerCase() === "asc"
        ? { fullName: 1 }
        : sortOrder.toLowerCase() === "desc"
        ? { fullName: -1 }
        : { createdAt: -1 };

    // Aggregated customers list
    const customers = await userModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          fullName: 1,
          image: 1,
          phoneNumber: 1,
          address: 1,
        },
      },
    ]);

    // Format response
    const formattedCustomers = customers.map(
      ({ _id, image, fullName, phoneNumber, address }) => ({
        _id,
        image,
        fullName,
        phoneNumber,
        fullAddress: address,
      })
    );

    return res.status(200).json({
      success: true,
      totalCustomers,
      totalPages,
      currentPage: page,
      previous: page > 1,
      next: page < totalPages,
      customers: formattedCustomers,
    });
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ Get Customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { userId } = req.params;
    //   console.log("Incoming ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer ID." });
    }

    const customer = await userModel.findById(userId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const orders = await Order.find({
      user: userId,
      status: "Order Placed",
    }).populate("items.product");

    const formattedProducts = orders.flatMap((order) =>
      order.items.map((item) => ({
        // id: order._id,
        date: new Date(order.orderDate).toLocaleDateString("en-IN"),
        productName: item.product?.productName || "N/A",
        Quantity: item.quantity,
        price: item.price,
        // status: order.status,
        totalPrice: item.quantity * item.price,
      }))
    );

    return res.status(200).json({
      success: true,
      customerDetails: {
        image: customer.image,
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        gender: customer.gender,
        Address: customer.address,
      },
      LatestOrderDetails: formattedProducts,
    });
  } catch (error) {
    console.log("Error in getCustomerById:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCustomers, getCustomerById };
