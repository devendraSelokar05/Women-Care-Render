const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");
const{EmergencyFeeModel}=require("../../models/SuperAdminModels/Settings");


//✅getAllOrders
const getAllOrders = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortOrder = "desc",
      branchName,
      search,
    } = req.query;

    
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const sortOrderValue = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const matchStage = {};

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/").map((part) => parseInt(part, 10));
      return new Date(year, month - 1, day);
    };

    if (search) {
      const exactDate = parseDate(search);
      const startOfDay = new Date(exactDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(exactDate.setHours(23, 59, 59, 999));

      matchStage["orderDate"] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (branchName) {
      matchStage["branchInfo.branchName"] = {
        $regex: new RegExp(branchName, "i"),
      };
    }

    const aggregatePipeline = [
      {
        $lookup: {
          from: "branches",
          localField: "branchInfo",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      { $unwind: "$branchInfo" },
      { $sort: { createdAt: sortOrderValue } },
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productsInfo",
        },
      },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            {
              $addFields: {
                page,
                limit,
              },
            },
          ],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await Order.aggregate(aggregatePipeline);

    const orders = result[0].data;
    const metadata = result[0].metadata[0] || {
      total: 0,
      page,
      limit,
    };

    const total = metadata.total;
    const totalPages = Math.ceil(total / limit);
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const simplifiedOrders = orders.map((order) => ({
      orderDate: formatDate(new Date(order.orderDate)),
      orderId: order.orderId,
      orderStatus: order.status || order.orderStatus,
      // branchName: order.branchInfo?.branchName, // Uncomment if needed
    }));

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      total,
      totalPages,
      currentPage: page,
      previous: hasPrevious,
      next: hasNext,
      data: simplifiedOrders,
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
    const { id } = req.params;

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

    let emergencyFeeAmount = 0;
    if (order.emergencyDelivery) {
      const feeRecord = await EmergencyFeeModel.findOne().sort({ createdAt: -1 });
      if (feeRecord) {
        emergencyFeeAmount = feeRecord.feeAmount;
      }
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
      DeliveryType: order.emergencyDelivery ? `Emergency( ₹${emergencyFeeAmount} Extra) `: "Normal Delivery",
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
