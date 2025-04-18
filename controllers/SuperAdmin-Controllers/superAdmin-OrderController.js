const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");

//✅getAllOrders
const getAllOrders = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const sortOrderValue = sortOrder === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrderValue };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let orders = await Order.find()
      .sort(sortOptions)
      .populate("user", "fullName phoneNumber email address")
      .populate(
        "items.product",
        "name price brand productName productDescription productSubType size quantity productCode image"
      );

    const allBranches = await branchModel.find();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const userAddress = order.user?.address || "";
        const matchedBranch = allBranches.find((branch) => {
          const servicePin = branch.servicePinCode?.toString();
          return (
            userAddress.includes(servicePin) ||
            branch.fullAddress.includes(userAddress)
          );
        });

        return {
          ...order.toObject(),
          branchInfo: matchedBranch || null,
        };
      })
    );

    let filteredOrders = enrichedOrders;

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filteredOrders = enrichedOrders.filter((order) => {
        return (
          searchRegex.test(order.user?.fullName) ||
          searchRegex.test(order.user?.email) ||
          searchRegex.test(order.user?.phoneNumber?.toString()) ||
          searchRegex.test(order.branchInfo?.branchName || "") ||
          searchRegex.test(order.branchInfo?.phoneNumber?.toString() || "") ||
          order.items?.some(
            (item) =>
              searchRegex.test(item.product?.name || "") ||
              searchRegex.test(item.product?.brand || "") ||
              searchRegex.test(item.product?.productName || "") ||
              searchRegex.test(item.product?.productDescription || "")
          )
        );
      });
    }

    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / parseInt(limit));
    const paginatedOrders = filteredOrders.slice(skip, skip + parseInt(limit));

    const simplifiedOrders = paginatedOrders.map((order) => ({
      orderDate: order.orderDate,
      orderId: order._id,
      orderStatus: order.status || order.orderStatus,
    }));

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: simplifiedOrders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

//✅getOrderById
const getOrderById = async (req, res) => {
  try {
    const { id} = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "fullName phoneNumber email address")
      .populate(
        "items.product",
        "image productCode brand productSubType productDescription size price"
      )
      .populate("branchInfo");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let matchedBranch = null;

    if (order.branchInfo) {
      matchedBranch = {
        name: order.branchInfo.branchName,
        phone: order.branchInfo.phoneNumber,
        fullAddress: order.branchInfo.fullAddress,
      };
    } else {
      const allBranches = await branchModel.find();
      const userAddress = order.user?.address?.toLowerCase() || "";

      const found = allBranches.find((branch) => {
        const servicePin = branch.servicePinCode?.toString() || "";
        const fullBranchAddress = branch.fullAddress?.toLowerCase() || "";

        return (
          userAddress.includes(servicePin) ||
          fullBranchAddress.includes(userAddress) ||
          userAddress.includes(fullBranchAddress)
        );
      });

      if (found) {
        matchedBranch = {
          name: found.branchName,
          phone: found.phoneNumber,
          fullAddress: found.fullAddress,
        };
      }
    }

    const firstItem = order.items?.[0];

    const simplifiedOrder = {
      image: firstItem?.product?.image[0],
      OrderID: order.orderId,

      customerInfo: {
        name: order.user?.fullName,
        phone: order.user?.phoneNumber,
        email: order.user?.email,
        address: order.user?.address,
      },

      branchInfo: matchedBranch,

      ProductCode: firstItem?.product?.productCode,
      ProductBrand: firstItem?.product?.brand,
      ProductSubType: firstItem?.product?.productSubType,
      ProductDescription: firstItem?.product?.productDescription,
      Size: firstItem?.product?.size,
      OrderQuantity: firstItem?.quantity,
      Price: firstItem?.product?.price,
      OrderStatus: order.status,
      PaymentMode: order.paymentMethod,
      DeliveryType: order.emergencyDelivery ? "Emergency (₹40 Extra)" : "Normal Delivery",
      GrandTotal: order.totalAmount,

      ...(order.status === "Cancelled" && {
        reason: order.cancelReason || order.otherReason || "N/A",
      }),
    };

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: simplifiedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
};
