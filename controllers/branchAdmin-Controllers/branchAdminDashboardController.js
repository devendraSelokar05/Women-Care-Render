const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");
// const Product = require("../../models/SuperAdminModels/Product");
const Delivery = require("../../models/SuperAdminModels/DeliveryBoy") 
const BranchProduct = require("../../models/BranchAdminModels/branchAdminProducts"); 


 
//✅ Get All Delivery Boys according to Branch
const getAllDelieveryBoys = async (req, res) => {
  try {
    const branch = req.branchAdmin.branch;

    // Fetch all delivery boys belonging to the same branch
    const deliveryBoys = await Delivery.find({ branch: branch });

    const totalDeliveryBoys = deliveryBoys.length;

    // Filter delivery boys created this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthDeliveryBoys = deliveryBoys.filter((boy) => {
      const createdAt = new Date(boy.createdAt);
      return (
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      );
    }).length;

    const changePercent =
      totalDeliveryBoys === 0
        ? "0%"
        : ((thisMonthDeliveryBoys / totalDeliveryBoys) * 100).toFixed(2) + "%";

    return res.status(200).json({
      success: true,
      totalDeliveryBoys,
      thisMonthDeliveryBoys,
      changePercent,
      deliveryBoys,  // ✅ Sending full list of delivery boys
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

 
//✅ Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const branchId = req.branchAdmin.branch;
 
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
 
    const totalOrders = await Order.countDocuments({ branchInfo: branchId });
 
    const thisMonthOrders = await Order.countDocuments({
      branchInfo: branchId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 0),
      },
    });
 
    const changePercent =
      totalOrders === 0
        ? "0%"
        : ((thisMonthOrders / totalOrders) * 100).toFixed(2) + "%";
 
    return res.status(200).json({
      success: true,
      totalOrders,
      thisMonthOrders,
      changePercent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};
 
 
const calculatePercentageChange = (thisMonth, total) => {
  if (total === 0) return "0.0";  
  return ((thisMonth / total) * 100).toFixed(1);
};
 
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};
 
//✅ Gwt All Orders delivered Income
const getAllOrdersDeliveredIncome = async (req, res) => {
  try {
    const branchId = req.branchAdmin.branch; 
 
    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch not found for admin" });
    }
 
    const startOfMonth = getStartOfMonth();
 
    const totalIncomeResult = await Order.aggregate([
      { 
        $match: { 
          status: "Delivered",
          branchInfo: branchId
        } 
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$totalAmount" }
        }
      }
    ]);
 
    const totalIncome = totalIncomeResult[0]?.totalIncome || 0;
 
    const thisMonthIncomeResult = await Order.aggregate([
      { 
        $match: { 
          status: "Delivered",
          branchInfo: branchId,
          createdAt: { $gte: startOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          thisMonthIncome: { $sum: "$totalAmount" }
        }
      }
    ]);
 
    const thisMonthIncome = thisMonthIncomeResult[0]?.thisMonthIncome || 0;
 
    const changePercent = calculatePercentageChange(thisMonthIncome, totalIncome);
 
    return res.status(200).json({
      success: true,
      branchId: branchId,
      totalIncome: totalIncome,
      thisMonthIncome: thisMonthIncome,
      changePercent: `${changePercent}%`
    });
 
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
 
 //✅ Get Product Count
const getProductCount = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const branchId = req.branchAdmin.branch; 
 
    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch not found for admin" });
    }
 
    const branchProducts = await BranchProduct.find({ branch: branchId }).populate({
      path: "product",
      match: {
        $or: [
          { brand: { $regex: search, $options: "i" } },
          { productName: { $regex: search, $options: "i" } },
          { productSubType: { $regex: search, $options: "i" } },
        ],
      },
    });
 
    const filteredProducts = branchProducts.filter(bp => bp.product !== null);
 
    const totalProducts = filteredProducts.length;
 
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 
    const thisMonthProducts = filteredProducts.filter(bp => {
      return bp.createdAt >= firstDayOfMonth;
    }).length;
 
    const percentValue = totalProducts !== 0
      ? ((thisMonthProducts / totalProducts) * 100).toFixed(1)
      : 0;
 
    const percentIncrease = `${percentValue}%`;
 
    res.status(200).json({
      success: true,
      branchId: branchId,
      totalProducts,
      thisMonthProducts,
      percentIncrease,
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
    const branchName = req.query.branchName?.trim();

    const branch = await branchModel.findOne({ branchName });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with name "${branchName}" not found.`,
      });
    }

    const allOrders = await Order.find({ branchInfo: branch._id })
      .populate("user", "name email")
      .populate("items.product", "productName")
      .populate("branchInfo", "branchName");

    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    let totalSalesThisMonth = 0;
    let totalSalesLastMonth = 0;

    const formattedOrders = [];

    for (const order of allOrders) {
      const orderDate = new Date(order.createdAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      for (const item of order.items) {
        const orderAmount = item.price * item.quantity;

        // **Summation Logic** for current and last month
        if (orderMonth === currentMonth && orderYear === currentYear) {
          totalSalesThisMonth += orderAmount;
        } else if (
          (orderMonth === (currentMonth - 1) && orderYear === currentYear) || 
          (currentMonth === 0 && orderMonth === 11 && orderYear === currentYear - 1)
        ) {
          // Handle January correctly
          totalSalesLastMonth += orderAmount;
        }

        formattedOrders.push({
          productName: item.product?.productName || "N/A",
          totalOrder: item.quantity,
          status: order.status || "Pending",
          totalAmount: `₹${orderAmount.toFixed(2)}`,
          orderDate: order.createdAt,
        });
      }
    }

    let percentageChange = 0;
    if (totalSalesLastMonth > 0) {
      percentageChange = ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth) * 100;
    }

    const recentOrders = formattedOrders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      branch: branchName,
      totalSalesThisMonth: `₹${totalSalesThisMonth.toFixed(2)}`,
      change: `${percentageChange.toFixed(2)}%`,
      recentOrders,
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
 
 
 
 