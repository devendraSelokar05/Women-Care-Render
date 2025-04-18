const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");
const Product = require("../../models/SuperAdminModels/Product");
const Delivery = require("../../models/SuperAdminModels/DeliveryBoy") 


 
//✅ Get All Delivery Boys
const getAllDelieveryBoys = async (req, res) => {
  try {
    const totalDelieveryBoys = await Delivery.countDocuments();
    return res.status(200).json({ totalDelieveryBoys });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false, error: error.message });
  }
};
 

//✅ Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.countDocuments();
    return res.status(200).json({ orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false, error: error.message });
  }
};
 
 //✅ Get All Delivered Orders Income
const getAllOrdersDeliveredIncome = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$totalAmount" } // Change to the correct amount field if needed
        }
      }
    ]);
 
    const totalIncome = result[0]?.totalIncome || 0;
 
    return res.status(200).json({
      success: true,
      incomeFromDeliveredOrders: totalIncome
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
 
 //✅ Get Product Count by Search
const getProductCount = async (req, res) => {
  try {
      const { search = "" } = req.query;
 
      const searchFilter = {
          $or: [
              { brand: { $regex: search, $options: "i" } },
              { productName: { $regex: search, $options: "i" } },
              { productSubType: { $regex: search, $options: "i" } },
          ],
      };
 
      const totalProducts = await Product.countDocuments(searchFilter);
 
      res.status(200).json({
          success: true,
          totalProducts,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
  }
};
 
 //✅ Get Top Selling Brands by Month
const getTopSellingBrands = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
 
    // Delivered orders for this month
    const salesThisMonth = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          orderDate: { $gte: startOfThisMonth }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", // collection name in MongoDB
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalDeliveredThisMonth: { $sum: "$items.quantity" }
        }
      }
    ]);
 
    // Delivered orders for last month
    const salesLastMonth = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          orderDate: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalDeliveredLastMonth: { $sum: "$items.quantity" }
        }
      }
    ]);
 
    // Merge both months' data
    const brandSales = {};
 
    salesLastMonth.forEach((b) => {
      brandSales[b._id] = {
        brand: b._id,
        salesLastMonth: b.totalDeliveredLastMonth,
        salesThisMonth: 0
      };
    });
 
    salesThisMonth.forEach((b) => {
      if (!brandSales[b._id]) {
        brandSales[b._id] = {
          brand: b._id,
          salesLastMonth: 0,
          salesThisMonth: b.totalDeliveredThisMonth
        };
      } else {
        brandSales[b._id].salesThisMonth = b.totalDeliveredThisMonth;
      }
    });
 
    const result = Object.values(brandSales).sort(
      (a, b) => b.salesThisMonth - a.salesThisMonth
    );
 
    res.status(200).json({
      success: true,
      topDeliveredBrands: result
    });
  } catch (err) {
    console.error("Error in getTopDeliveredBrands:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};
 
 
//✅ Get Recent Orders
const getRecentOrders = async (req, res) => {
  try {
    const { branchName } = req.query;
 
    const branch = await branchModel.findOne({ branchName });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with name "${branchName}" not found.`,
      });
    }
 
    const orders = await Order.find({ branchInfo: branch._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("items.product", "productName")
      .populate("branchInfo", "branchName");
 
    const formattedOrders = [];
 
    for (const order of orders) {
      for (const item of order.items) {
        formattedOrders.push({
          // trackingNo: order._id.toString().slice(-8), // last 8 chars of ObjectId as Tracking No.
          productName: item.product?.productName || "N/A",
          totalOrder: item.quantity,
          status: order.status || "Pending", // Default or pull from schema
          totalAmount: `₹${item.price * item.quantity}`,
        });
      }
    }
 
    res.status(200).json({
      success: true,
      branch: branchName,
      recentOrders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching formatted recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while formatting recent orders",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDelieveryBoys,
  getAllOrders,
  getProductCount,
  getAllOrdersDeliveredIncome,
  getTopSellingBrands,
  getRecentOrders
};

 