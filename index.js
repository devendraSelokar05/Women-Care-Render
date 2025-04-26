const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");



//✅ Importing All superAdmin Related Routes
const superAdminRoutes = require("./routes/SuperAdmin-Routes/Super-AdminRoutes"); 
const branchRoutes = require("./routes/SuperAdmin-Routes/branchRoutes");
const deliveryBoyRoutes = require("./routes/SuperAdmin-Routes/deliveryRoutes");
const bannerRoutes = require("./routes/SuperAdmin-Routes/bannerRoutes");
const dashboardRoutes = require("./routes/SuperAdmin-Routes/dashboardRoutes");
const productRoutes = require("./routes/SuperAdmin-Routes/productRoutes");
const testimonialRoutes = require("./routes/SuperAdmin-Routes/testimonialRoutes");
const settingsRoutes = require("./routes/SuperAdmin-Routes/SettingRoutes");
const customerRoutes = require("./routes/SuperAdmin-Routes/customerRoutes");
const superAdminOrderRoutes = require("./routes/SuperAdmin-Routes/superAdminOrderRoutes");
const notificationsRoutes = require("./routes/SuperAdmin-Routes/notficationsRoutes");
const superAdminPaymentHistoryRoutes = require("./routes/SuperAdmin-Routes/paymentHistoryRoutes");






//✅ Importing All Branch Admin Related Routes
const branchAdminRoutes = require("./routes/BranchAdmin-Routes/branchAdminRoutes");
const branchDetailsRoutes = require("./routes/BranchAdmin-Routes/branchAdminDetailsRoutes");
const branchAdminProductRoutes = require("./routes/BranchAdmin-Routes/branchAdminProductRoutes");
const branchAdminDeliveryBoyRoutes = require("./routes/BranchAdmin-Routes/branch-adminDeliveryBoyRoutes");
const branchSettingsRoutes = require("./routes/BranchAdmin-Routes/branchSettingsRoutes");
const branchOrderRoutes = require("./routes/BranchAdmin-Routes/branch-adminOrderRoutes");
const branchAdminCustomerRoutes = require("./routes/BranchAdmin-Routes/branchAdminCustomerRoutes");
const branchNotificationsRoutes = require("./routes/BranchAdmin-Routes/branchAdminNotificationRoutes");
const branchAdminDashboardRoutes = require("./routes/BranchAdmin-Routes/branchAdminDashboardRoutes");
const branchPaymentHistoryRoutes = require("./routes/BranchAdmin-Routes/branchPaymentHistoryRoutes");






//✅ Importing All User Related Routes
const userRoutes = require("./routes/user-Routes/useRoutes");
const userProductRoutes = require("./routes/user-Routes/userProductRoutes");
const cartRoutes = require("./routes/user-Routes/CartRoutes");
const userOrderRoutes = require("./routes/user-Routes/orderNow-Routes");
const contactRoutes = require("./routes/user-Routes/conatctUs-Routes");
const reviewRoutes = require("./routes/user-Routes/reviewRoutes");
const userSettingsRoutes = require("./routes/user-Routes/userSettingsRoutes");
const userNotificationsRoutes = require("./routes/user-Routes/userNotficationsRoutes");


//✅ Importing All Delivery Boy Routes
const deliveryBoyModelRoutes = require("./routes/DeliveryBoyRoutes/deliveryBoyRoutes");
const deliveryBoyNotificationRoutes = require("./routes/DeliveryBoyRoutes/deliveryBoyNotificationRoutes");
const deliveryBoyOrderRoutes = require("./routes/DeliveryBoyRoutes/deliveryBoyorderRoutes");
const deliverySettingsRoutes = require("./routes/DeliveryBoyRoutes/deliverySettingsRoutes");

const app = express();

//✅ Middleware
app.use(express.json());
app.use(cors());

//✅ Connect to Database
connectDB();


//✅ Super Admin  Routes
app.use("/api/superAdmin",superAdminRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/deliveryBoy", deliveryBoyRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/order", superAdminOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notification", notificationsRoutes);
app.use("/api/payment", superAdminPaymentHistoryRoutes);

//✅ Branch Admin Routes
app.use("/api/branchAdmin", branchAdminRoutes);
app.use("/api/branchAdmin", branchDetailsRoutes);
app.use("/api/branchAdminProduct", branchAdminProductRoutes);
app.use("/api/branchAdminDeliveryBoy", branchAdminDeliveryBoyRoutes);
app.use("/api/branchSettings", branchSettingsRoutes);
app.use("/api/branchOrder", branchOrderRoutes);
app.use("/api/branchCustomer", branchAdminCustomerRoutes);
app.use("/api/branchAdmin/notification", branchNotificationsRoutes);
app.use("/api/branchAdmin/dashboard", branchAdminDashboardRoutes);
app.use("/api/branchAdmin/payment", branchPaymentHistoryRoutes);

//✅ User Routes
app.use("/api/user", userRoutes);
app.use("/api/user/Product", userProductRoutes);
app.use("/api/user", cartRoutes);
app.use("/api/user", userOrderRoutes);
app.use("/api/user", contactRoutes);
app.use("/api/user/review", reviewRoutes);
app.use("/api/user/settings", userSettingsRoutes);
app.use("/api/user/notification", userNotificationsRoutes);

//✅ Delivery Boy Routes
app.use("/api/deliveryBoy", deliveryBoyModelRoutes);
app.use("/api/deliveryBoy/notification", deliveryBoyNotificationRoutes);
app.use("/api/order", deliveryBoyOrderRoutes);
app.use("/api/deliverySettings", deliverySettingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
