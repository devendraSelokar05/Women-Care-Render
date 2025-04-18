const Order = require("../../models/UserModels/orderNow");
const mongoose = require("mongoose")

//✅ Accept delivery Boy Order
const acceptOrder = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy?.id;
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }
 
    const order = await Order.findById(id);
 
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    if (order.deliveryBoy && order.deliveryStatus === "Accepted") {
      return res.status(400).json({
        message: "Order already accepted",
        deliveryBoy: order.deliveryBoy,
      });
    }
 
    order.deliveryBoy = deliveryBoyId;
    order.deliveryStatus = "Accepted";
 
    await order.save();
    await order.populate("deliveryBoy");
 
    return res.status(200).json({
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
 
//✅ Cancel delivery Boy Order
  const canceldeliveryBoyOrder = async (req, res) => {
    try {
      const deliveryBoyId = req.deliveryBoy.id.toString(); 
      const { id } = req.params;
      const { cancelReason, otherReason } = req.body;
  
      const validReasons = [
        "I want to change the Product",
        "Not available on the delivery time",
        "Price High",
        "I ordered wrong Product",
        "Other",
      ];
  
      if (!validReasons.includes(cancelReason)) {
        return res.status(400).json({ message: "Invalid cancellation reason." });
      }
  
      if (cancelReason === "Other" && (!otherReason || otherReason.trim() === "")) {
        return res.status(400).json({
          message: "Please provide a reason for cancellation.",
        });
      }
  
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      if (order.status === "Cancelled") {
        return res.status(400).json({ message: "Order is already cancelled." });
      }
  
      // Update cancellation details
      order.deliveryBoy = null;                         
      order.deliveryStatus = "In Process";             
      order.status = "Cancelled";                      
      order.cancelReason = cancelReason;
      order.otherReason = cancelReason === "Other" ? otherReason : "N/A";
  
      await order.save({ timestamps: false });          
  
      return res.status(200).json({
        message: "Order cancelled successfully by delivery boy",
        order,
      });
  
    } catch (error) {
      console.error("Cancel delivery order error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  //✅ Get available orders for delivery boy
  const getAvailableOrders = async (req, res) => {
    try {
      const deliveryBoyId = req.deliveryBoy?.id;
  
      if (!deliveryBoyId) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }
  
      const orders = await Order.find({
        deliveryBoy: deliveryBoyId, 
        $or: [
          { status: { $regex: /^In Process$/i } },
          { deliveryStatus: { $regex: /^(In Process|Pending)$/i } }
        ]
      })
        .populate("user", "fullName")
        .populate("branchInfo", "branchName fullAddress")
        .populate({
          path: "items.product",
          select: "productName image user",
          populate: {
            path: "user",
            select: "fullName"
          }
        })
        .sort({ createdAt: -1 });
  
      const formattedOrders = orders.map(order => {
        const firstItem = order.items?.[0];
        const product = firstItem?.product;
  
        const buyerName = order.user?.fullName || "N/A";
        const sellerName =
          product?.user?.fullName || order.branchInfo?.branchName || "Seller";
        const productName = product?.productName || "N/A";
        const productImage = product?.image || "";
  
        const address = order.deliveryAddress;
        const fullAddress = `${address?.street || ""}, ${address?.city || ""}, ${address?.zipCode || ""}`;
        const encodedAddress = encodeURIComponent(fullAddress);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  
        return {
          id: order.id,
          orderId: order.orderId,
          productName,
          productImage,
          totalPrice: order.totalAmount,
          orderDate: order.createdAt,
          buyerName,
          sellerName,
          yourEarning: `₹${(order.totalAmount * 0.10).toFixed(0)}`,
          seeLocationUrl: googleMapsUrl,
          status: order.deliveryStatus || order.status || "In Process"
        };
      });
  
      res.status(200).json({ success: true, orders: formattedOrders });
    } catch (error) {
      console.error("Error fetching available orders:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching available orders",
        error: error.message
      });
    }
  };
  
  const getavaliableOrderDetails = async (req, res) => {
    try {
      const deliveryBoyId = req.deliveryBoy?.id;
      const { id: orderId } = req.params; // order ID from route parameter
  
      if (!deliveryBoyId) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }
  
      const order = await Order.findOne({
        _id: orderId,
        deliveryBoy: deliveryBoyId
      })
        .populate("user", "fullName")
        .populate("branchInfo", "branchName fullAddress")
        .populate({
          path: "items.product",
          select: "productName image user",
          populate: {
            path: "user",
            select: "fullName"
          }
        });
  
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      const firstItem = order.items?.[0];
      const product = firstItem?.product;
  
      const buyerName = order.user?.fullName || "N/A";
      const sellerName =
        product?.user?.fullName || order.branchInfo?.branchName || "Seller";
      const productName = product?.productName || "N/A";
      const productImage = product?.image || "";
      const price = order.totalAmount || 0;
  
      const address = order.deliveryAddress;
      const fullAddress = `${address?.street || ""}, ${address?.city || ""}, ${address?.zipCode || ""}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress};`
  
      const orderDetails = {
        orderId: order.orderId,
        productName,
        productImage,
        price,
        date:new Date(order.createdAt).toLocaleDateString('en-GB'),
        buyerName,
        sellerName,
        yourEarning:` ₹${(price * 0.10).toFixed(0)}`,
        seeLocationUrl: googleMapsUrl,
        status: order.deliveryStatus || order.status || "In Process"
      };
  
      res.status(200).json({ success: true, order: orderDetails });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching order details",
        error: error.message
      });
    }
  };
 
   //✅ Confirm payment
const confirmPayment = async (req, res) => {
    try {
      const { id } = req.params;
 
      const order = await Order.findById(id)
        .populate("user")
        .populate("items.product");
   
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
   
      if (order.deliveryStatus !== "Accepted") {
        return res.status(400).json({ message: "User has not accepted the delivery yet." });
      }
   
      let isCash = order.paymentMethod === "Cash" || order.paymentMethod === "COD";
   
      if (isCash) {
        order.cashReceived = true;
      }
   
      order.paymentStatus = "Success";
      order.status = "Delivered";
      order.deliveryStatus = "Delivered";
   
      await order.save();
   
      const responseData = {
        orderId: order.orderId,
        amount: order.totalAmount,
        yourEarning: `₹${(order.totalAmount * 0.10).toFixed(0)}`,
      };
   
      if (order.items.length > 0) {
        const firstProduct = order.items[0].product;
        responseData.productName = firstProduct?.productName || "N/A";
        responseData.productImage = firstProduct?.image || null;
      }
   
      if (isCash) {
        responseData.cashReceived = true;
      } else {
        // Online payment details
        responseData.customerName = order.user?.name || "N/A";
        responseData.date = new Date(order.updatedAt).toLocaleDateString();
        responseData.time = new Date(order.updatedAt).toLocaleTimeString();
        responseData.contactNumber = order.user?.contactNumber || "N/A";
        responseData.gender = order.user?.gender || "N/A";
        responseData.productDetails = order.items.map(item => ({
          productName: item.product?.name || "N/A",
          productImage: item.product?.image || null,
          quantity: item.quantity,
          price: item.price
        }));
      }
   
      return res.status(200).json({
        message: "Payment confirmed successfully",
        data: responseData
      });
   
    } catch (err) {
      console.error("Payment confirmation error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
   
  //✅ Get delivery boy summary
  const getDeliveryBoySummary = async (req, res) => {
    try {
      const deliveryBoyId = req.deliveryBoy.id;
   
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
   
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
   
      const allDeliveredOrders = await Order.find({
        deliveryBoy: deliveryBoyId,
        deliveryStatus: "Delivered"
      }).populate("items.product");
   
      const totalEarnings = allDeliveredOrders.reduce((sum, order) => {
        return sum + (order.totalAmount * 0.10 || 0);
      }, 0);
   
      const todayDeliveredOrders = allDeliveredOrders.filter(order =>
        order.updatedAt >= todayStart && order.updatedAt <= todayEnd
      );
   
      const todayEarnings = todayDeliveredOrders.reduce((sum, order) => {
        return sum + (order.totalAmount * 0.10 || 0);
      }, 0);
   
      const detailedOrders = allDeliveredOrders.map(order => ({
        id:order.id,
        orderId: order.orderId,
        productName: order.items[0]?.product?.productName || "N/A",
        image: order.items[0]?.product?.image || null,
        yourEarning: `₹${(order.totalAmount * 0.10).toFixed(0)}`,
        status: order.status
      }));
   
      return res.status(200).json({
        summary: {
          totalEarnings: `₹${totalEarnings.toFixed(0)}`,
          todayDeliveredOrders: todayDeliveredOrders.length,
          todayEarnings: `₹${todayEarnings.toFixed(0)}`
        },
        deliveredOrders: detailedOrders
      });
   
    } catch (err) {
      console.error("Error fetching delivery summary:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
   
   
   //✅ Get order details
  const getOrderDetails = async (req, res) => {
    try {
      const { id } = req.params;
   
      const order = await Order.findById(id)
        .populate("items.product") 
        .populate("user", "fullName phoneNumber") 
        .populate("items.product.seller", "name"); 
   
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
   
      const product = order.items[0]?.product;
      const address = order.deliveryAddress || {}; 
   
      const sellerName = product?.seller?.name || "N/A"; 
   
      const orderDetails = {
        orderId: order.orderId,
        productName: product?.productName || "N/A",
        image: product?.image || null,
        totalAmount: `₹${order.totalAmount}`,
        deliveryAddress: {
          name: address?.name || "N/A",
          street: address?.street || "N/A",
          city: address?.city || "N/A",
          zipcode: address?.zipCode || "N/A"
        },
        buyer: {
          name: order.user?.fullName || "N/A", // Full name of the buyer
          contact: order.user?.phoneNumber || "N/A"
        },
        seller: sellerName, // Seller name from the product's seller (Branch)
        date: order.updatedAt.toLocaleDateString(),
        yourEarning: `₹${(order.totalAmount * 0.10).toFixed(0)}`
      };
   
      return res.status(200).json(orderDetails);
   
    } catch (err) {
      console.error("Error getting order details:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
   
  // ✅ Get date-wise order history for delivery boy
  const getDateWiseOrderHistory = async (req, res) => {
    try {
      // Access the delivery boy ID from the authenticated delivery boy (via middleware)
      const deliveryBoyId = req.deliveryBoy.id;
   
      const { from, to } = req.query;
   
      const startDate = from ? new Date(from) : new Date('2000-01-01');
      startDate.setHours(0, 0, 0, 0);
   
      const endDate = to ? new Date(to) : new Date();
      endDate.setHours(23, 59, 59, 999);
   
      // 1. Fetch delivered orders for the authenticated delivery boy within the specified date range
      const deliveredOrders = await Order.find({
        deliveryBoy: deliveryBoyId,
        deliveryStatus: "Delivered",
        updatedAt: { $gte: startDate, $lte: endDate }
      })
        .populate("user", "name")
        .populate("items.product", "image")
        .sort({ updatedAt: -1 });
   
      // 2. Initialize counters
      let totalEarnings = 0;
      let totalDelivered = 0;
      const dateWiseOrders = {};
   
      // 3. Group orders by date
      deliveredOrders.forEach(order => {
        const deliveryDate = new Date(order.updatedAt);
        const dateKey = deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit'
        }); // Example: "Thu Dec 16"
   
        const earning = order.totalAmount * 0.10; // 10% commission
        totalEarnings += earning;
        totalDelivered++;
   
        const orderCard = {
          id:order.id,
          orderId: order.orderId,
          deliveredOn: `Delivered on ${dateKey}`,
          customerName: order.user?.name || "Customer",
          productImage: order.items[0]?.product?.image || null,
          yourEarning: `₹${earning.toFixed(0)}`
        };
   
        if (!dateWiseOrders[dateKey]) {
          dateWiseOrders[dateKey] = [];
        }
   
        dateWiseOrders[dateKey].push(orderCard);
      });
   
      // 4. Format response to match UI
      const orderHistory = Object.entries(dateWiseOrders).map(([date, orders]) => ({
        date,
        orders
      }));
   
      return res.status(200).json({
        totalDelivered,
        totalEarning: `₹${totalEarnings.toFixed(0)}`,
        orderHistory
      });
    } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
   
   
   // ✅ Get order history details
  const getOrderHistoryDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const deliveryBoyId = req.deliveryBoy._id; // ✅ Corrected this line
   
      const order = await Order.findOne({
        _id: id,
        deliveryBoy: deliveryBoyId,
        deliveryStatus: { $in: ["Accepted", "Delivered"] }
      })
        .populate("user", "fullName") // Buyer's name from User model
        .populate("items.product", "productName image seller") // Product details + seller ref
        .populate("items.product.seller", "fullName"); // Seller's name from User model
   
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
   
      const formatDateTime = (date) => {
        const options = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        };
        return new Date(date).toLocaleString("en-US", options).replace(",", " at");
      };
   
      const confirmedDate = formatDateTime(order.createdAt);
      const deliveredDate = formatDateTime(order.updatedAt);
   
      const sellerName = order.items[0]?.product?.seller?.fullName || "Unknown Seller";
      const buyerName = order.user?.fullName || "Customer";
   
      const response = {
        orderId: order.orderId,
        productName: `${order.items[0]?.product?.productName || "Product"}${order.items[0]?.quantity ? `, Pack of ${order.items[0].quantity}` : ""}`,
        productImage: order.items[0]?.product?.image || null,
        buyerName: buyerName,
        sellerName: sellerName,
        totalAmount: `₹${order.totalAmount}`,
        yourEarning: `₹${(order.totalAmount * 0.10).toFixed(0)}`,
        timeline: [
          { label: "Order Confirmed", date: confirmedDate },
          { label: "Delivered On", date: deliveredDate }
        ]
      };
   
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
   
 module.exports = {
    acceptOrder,
    canceldeliveryBoyOrder,
    getAvailableOrders,
    getavaliableOrderDetails,
    confirmPayment,
    getDeliveryBoySummary,
    getOrderDetails,
    getDateWiseOrderHistory,
    getOrderHistoryDetails
  };  
 
 