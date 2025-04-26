const Order = require("../../models/UserModels/orderNow");
const DeliveryBoy = require("../../models/SuperAdminModels/DeliveryBoy");
const User = require("../../models/UserModels/User");
const Product = require("../../models/SuperAdminModels/Product");

// ✅ Get Payment History with Proper Product Name Retrieval
const getPaymentHistory = async (req, res) => {
  try {
    const { date, paymentMethod, page = 1, limit = 10 } = req.query;

    const filter = {};

    // ✅ Validate & Convert Date Properly
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        filter.orderDate = { $gte: parsedDate, $lte: new Date(parsedDate).setHours(23, 59, 59, 999) };
      } else {
        return res.status(400).json({ message: "Invalid date format. Please provide a valid date." });
      }
    }

    if (paymentMethod) filter.paymentMethod = paymentMethod; // ✅ Filter by Cash/Online payments


    const orders = await Order.find(filter)
      .populate({ path: "deliveryBoy", model: DeliveryBoy, select: "fullName" }) // ✅ Fetch Only Delivery Boy Name
      .populate({
        path: "items.product",
        model: Product,
        select: "productName", // ✅ Fetch Only Product Name
      })
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecords = await Order.countDocuments(filter);

    // ✅ Extract Only Required Fields
    const paymentHistory = orders.map((order, index) => ({
      _id: order._id,
      date: new Date(order.orderDate).toLocaleDateString("en-GB"),
      productName: order.items.length > 0 && order.items[0].product?.productName ? order.items[0].product.productName : "N/A", // ✅ Ensure proper product name extraction
      deliveryBoyName: order.deliveryBoy?.fullName || "Not Assigned",
      status: order.paymentMode ? "Paid" : "Not Paid",
    }));

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecords / limit),
      paymentHistory, // ✅ Returns only selected fields
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ✅ View Payment History for a Specific Delivery Boy (Using Orders)
const viewPaymentByDeliveryBoy = async (req, res) => {
    try {
      const { deliveryBoyId } = req.params;
      const { page = 1, limit = 10 } = req.query;
  
      const orders = await Order.find({ deliveryBoy: deliveryBoyId })
        .populate({ path: "deliveryBoy", model: DeliveryBoy, select: "fullName" }) // ✅ Fetch Only Delivery Boy Name
        .populate({ path: "user", model: User, select: "fullName" }) // ✅ Fetch Customer Name
        .populate({ path: "items.product", model: Product, select: "productName" })
        .sort({ orderDate: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      if (!orders.length) {
        return res.status(404).json({ message: "No payment history found for the selected delivery boy." });
      }
  
      const grandTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
      res.status(200).json({
        success: true,
        deliveryBoy: {
          _id: orders[0].deliveryBoy._id,
          fullName: orders[0].deliveryBoy.fullName,
          Date: orders.some(order => order.outForDeliveryAt) 
            ? new Date(orders[0].outForDeliveryAt).toLocaleDateString("en-GB") 
            : "Pending" // ✅ Assign delivery date
        },
        grandTotal,
        totalRecords: orders.length,
        paymentHistory: orders.map((order, index) => ({
          _id: order._id,
          productName: order.items.length > 0 && order.items[0].product?.productName ? order.items[0].product.productName : "N/A",
          customerName: order.user?.fullName || "N/A",
          totalAmount: order.totalAmount,
          status: order.paymentMode ? "Delivered" : "Not Delivered Yet"
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };

module.exports = { getPaymentHistory, viewPaymentByDeliveryBoy };
