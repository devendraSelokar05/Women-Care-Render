const userModel = require("../../models/UserModels/User");
const deliveryModel = require("../../models/SuperAdminModels/DeliveryBoy");
const branchModel = require("../../models/SuperAdminModels/branch");
const Order = require("../../models/UserModels/orderNow");

// 🧮 Utility: Percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return "0.0";
  return (((current - previous) / previous) * 100).toFixed(1);
};

// 📆 Utility: Start of the month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

//✅ getTotalBranches
const getAllBranchesCount = async (req, res) => {
  try {
    const startOfMonth = getStartOfMonth();

    const [totalBranches, thisMonth] = await Promise.all([
      branchModel.countDocuments(),
      branchModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const previous = totalBranches - thisMonth;
    const changePercent = calculatePercentageChange(thisMonth, previous);

    return res.status(200).json({
      success: true,
      totalBranches,
      thisMonth,
      changePercent: `${changePercent}%`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

//✅ getTotalDelieveryBoys
const getAllDelieveryBoysCount = async (req, res) => {
  try {
    const startOfMonth = getStartOfMonth();

    const [totalDeliveryBoys, thisMonth] = await Promise.all([
      deliveryModel.countDocuments(),
      deliveryModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const previous = totalDeliveryBoys - thisMonth;
    const changePercent = calculatePercentageChange(thisMonth, previous);

    return res.status(200).json({
      success: true,
      totalDeliveryBoys,
      thisMonth,
      changePercent: `${changePercent}%`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

//✅ getAllCustomers
const getAllCustomersCount = async (req, res) => {
  try {
    const startOfMonth = getStartOfMonth();

    const [totalCustomers, thisMonth] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const previous = totalCustomers - thisMonth;
    const changePercent = calculatePercentageChange(thisMonth, previous);

    return res.status(200).json({
      success: true,
      totalCustomers,
      thisMonth,
      changePercent: `${changePercent}%`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

//✅ get All Orders
const getAllOrdersCount = async (req, res) => {
  try {
    const startOfMonth = getStartOfMonth();

    const [totalOrders, thisMonth] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const previous = totalOrders - thisMonth;
    const changePercent = calculatePercentageChange(thisMonth, previous);

    return res.status(200).json({
      success: true,
      totalOrders,
      thisMonth,
      changePercent: `${changePercent}%`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

//✅getYearDropdownData
const getYearDropdownData = async (req, res) => {
  try {
    const years = [];
    for (let year = 2000; year <= 2030; year++) {
      years.push(year);
    }
    return res.status(201).json({ years });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

//✅ getBranchNameDropdownData
const getAllBranchesDropdown = async (req, res) => {
  try {
    const branches = await branchModel.find().select("branchName");

    return res.status(201).json({
      success: true,
      branches,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};
     

//✅ etBranchOverview
const getBranchOverview = async (req, res) => {
  try {
    const { year, branchName } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear + 1}-01-01`);

    // Deliveries
    let deliveries = await deliveryModel
      .find({
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .populate("branchInfo");

    if (branchName) {
      deliveries = deliveries.filter(
        (d) => d.branchInfo?.branchName === branchName
      );
    }

    // Orders with user + branch populated
    let orders = await Order.find({
      orderDate: { $gte: startDate, $lt: endDate },
    })
      .populate("branchInfo")
      .populate("user");

    if (branchName) {
      orders = orders.filter((o) => o.branchInfo?.branchName === branchName);
    }

    // Customers directly from userModel
    let customers = await userModel
      .find({
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .populate("branchInfo");

    if (branchName) {
      customers = customers.filter(
        (c) => c.branchInfo?.branchName === branchName
      );
    }

    // Include users from orders
    const customerFromOrders = orders.map((o) => o.user).filter(Boolean);
    const allCustomers = [...customers, ...customerFromOrders];

    const uniqueCustomerIds = new Set(
      allCustomers.map((c) => c._id.toString())
    );

    const report = months.map((month, index) => {
      const totalDelivery = deliveries.filter(
        (d) => new Date(d.createdAt).getUTCMonth() === index
      ).length;

      const totalOrder = orders.filter(
        (o) => new Date(o.orderDate).getUTCMonth() === index
      ).length;

      const totalCustomer = [...customers, ...customerFromOrders]
        .filter((c) => new Date(c.createdAt).getUTCMonth() === index)
        .reduce((acc, cur, idx, arr) => {
          return uniqueCustomerIds.has(cur._id.toString()) ? acc + 1 : acc;
        }, 0);

      return {
        month,
        totalDelivery,
        totalOrder,
        totalCustomer,
      };
    });

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error generating branch overview:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//✅ getDeliveryReport
const getDeliveryReport = async (req, res) => {
  try {
    const { year, branchName } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear + 1}-01-01`);

    let deliveries = await deliveryModel
      .find({
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .populate("branchInfo");

    if (branchName) {
      deliveries = deliveries.filter(
        (d) => d.branchInfo?.branchName === branchName
      );
    }

    const monthlyCount = new Array(12).fill(0);
    deliveries.forEach((delivery) => {
      const monthIndex = new Date(delivery.createdAt).getMonth();
      monthlyCount[monthIndex]++;
    });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const report = months.map((month, index) => ({
      month,
      totalDelivery: monthlyCount[index],
    }));

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error fetching delivery report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//✅ getIncomeOverview
const getIncomeOverview = async (req, res) => {
  try {
    const { branchName } = req.query;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const dayMap = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const incomeData = [];

    for (let i = 0; i <= 6; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      dayEnd.setHours(0, 0, 0, 0);

      let orders = await Order.find({
        orderDate: { $gte: dayStart, $lt: dayEnd },
      }).populate("branchInfo");

      if (branchName) {
        orders = orders.filter(
          (order) => order.branchInfo?.branchName === branchName
        );
      }

      const total = orders.reduce(
        (acc, order) => acc + (order.totalAmount || 0),
        0
      );

      incomeData.push({
        day: dayMap[i],
        income: total,
      });
    }

    const totalIncome = incomeData.reduce((acc, curr) => acc + curr.income, 0);

    res.status(200).json({
      totalIncome,
      incomeData,
    });
  } catch (error) {
    console.error("Income overview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllBranchesCount,
  getAllDelieveryBoysCount,
  getYearDropdownData,
  getAllCustomersCount,
  getAllBranchesDropdown,
  getAllOrdersCount,
  getBranchOverview,
  getDeliveryReport,
  getIncomeOverview,
};
