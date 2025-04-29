const Cart = require("../../models/UserModels/CartModel");
const Product = require("../../models/SuperAdminModels/Product");
const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");
const branchAdminNotificationModel = require('../../models/BranchAdminModels/branchAdminNotification'); 
const BranchAdmin = require("../../models/BranchAdminModels/branchAdmin");
const userNotificationModel = require("../../models/UserModels/userNotification");
const {EmergencyFeeModel} = require("../../models/SuperAdminModels/Settings");


//✅ Add Item  To Cart
const addToCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += parsedQuantity;
    } else {
      cart.items.push({
        productId,
        quantity: parsedQuantity,
        price: product.price,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//✅ Get All Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
 
    const cart = await Cart.findOne({ userId }).populate("items.productId");
 
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          items: [],
          totalAmount: 0,
        },
      });
    }
 
    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//✅ Increment Quantity
const incrementCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Quantity increased", cart });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//✅ Decrement Quantity
const decrementCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      if (cart.items[existingItemIndex].quantity > 1) {
        cart.items[existingItemIndex].quantity -= 1;
      } else {
        cart.items.splice(existingItemIndex, 1);
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Quantity decreased", cart });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//✅ Remove Item From Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Item removed from cart", cart });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//✅ Craete Order From Cart
const BuyOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
 
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Add products first." });
    }
 
    const { emergencyDelivery, deliveryAddress, paymentMethod } = req.body;
    const emergency = emergencyDelivery === "true";
 
    let totalAmount = 0;
    let orderItems = [];
    let insufficientStockProducts = [];
 
    const firstProduct = cart.items[0]?.productId;
    const productImage = firstProduct?.image?.[0] || "";
 
    const userAddress = req.user.address;
    const pinCodeMatch = userAddress.match(/\b\d{6}\b/);
    const userPinCode = pinCodeMatch ? pinCodeMatch[0] : null;
 
    if (!userPinCode) {
      return res.status(400).json({ message: "No valid 6-digit PIN code found in your address." });
    }
 
    const matchedBranch = await branchModel.findOne({ servicePinCode: userPinCode });
 
    if (!matchedBranch) {
      return res.status(404).json({ message: "No branch found matching your address's PIN code." });
    }
 
    const branchAdmin = await BranchAdmin.findOne({ branch: matchedBranch._id });
 
    if (!branchAdmin) {
      return res.status(404).json({ message: "No branch admin found for this branch." });
    }
 
    const branchInfo = matchedBranch._id;
    const branchAdminId = branchAdmin._id;
 
    const BranchProduct = require("../../models/BranchAdminModels/branchAdminProducts");
 
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(400).json({ message: "One of the products in your cart is missing." });
      }
 
      const branchProduct = await BranchProduct.findOne({
        branch: matchedBranch._id,
        product: product._id,
      });
 
      if (!branchProduct || branchProduct.quantity < item.quantity || product.stock < item.quantity) {
        insufficientStockProducts.push(product.productName || product.name || "Unnamed Product");
        continue;
      }
 
      totalAmount += item.quantity * item.price;
 
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price,
      });
 
      product.stock -= item.quantity;
      await product.save();
 
      branchProduct.quantity -= item.quantity;
      await branchProduct.save();
    }
 
    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({
        message: `Not enough stock for: ${insufficientStockProducts.join(", ")}`,
      });
    }
 
    let emergencyFee = 0;
    if (emergency) {
      const feeDoc = await EmergencyFeeModel.findOne().sort({ createdAt: -1 }); // Fetch latest fee
      emergencyFee = feeDoc?.feeAmount || 0;
      totalAmount += emergencyFee;
    }
 
    const generateUniqueOrderId = async () => {
      const prefix = "ORD000";
      let nextNumber = 1;
      const latestOrder = await Order.findOne({ orderId: { $regex: `^${prefix}` } })
        .sort({ createdAt: -1 })
        .lean();
 
      if (latestOrder) {
        const lastId = latestOrder.orderId.replace(prefix, "");
        const parsed = parseInt(lastId);
        if (!isNaN(parsed)) {
          nextNumber = parsed + 1;
        }
      }
 
      let newOrderId;
      let exists = true;
      while (exists) {
        newOrderId = prefix + nextNumber.toString().padStart(1, "0");
        const existingOrder = await Order.findOne({ orderId: newOrderId });
        if (!existingOrder) {
          exists = false;
        } else {
          nextNumber++;
        }
      }
 
      return newOrderId;
    };
 
    const orderId = await generateUniqueOrderId();
 
    const newOrder = new Order({
      user: userId,
      orderId,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      items: orderItems,
      emergencyDelivery: emergency,
      branchInfo,
    });
 
    await newOrder.save();
 
    const populatedOrder = await Order.findById(newOrder._id).populate("user", "fullName image");
 
    const notification = new branchAdminNotificationModel({
      branchAdminId: branchAdminId,
      title: "New Order Placed",
      message: `Order #${orderId} has been placed for delivery.`,
      isRead: false,
      createdAt: new Date(),
      id: populatedOrder.user._id,
      fullName: populatedOrder.user.fullName || "Unknown",
      image: populatedOrder.user.image || "",
    });
 
    await notification.save();
 
    const userNotification = new userNotificationModel({
      userId: userId,
      title: "Order Placed",
      message: "Your order has been placed successfully",
      image: productImage
    });
 
    await userNotification.save();
 
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
 
    return res.status(201).json({
      message: "Order placed successfully",
      branchId: branchInfo,
      branchAdminId: branchAdminId,
      order: {
        user: newOrder.user,
        orderId: newOrder.orderId,
        deliveryAddress: newOrder.deliveryAddress,
        paymentMethod: newOrder.paymentMethod,
        emergencyDelivery: newOrder.emergencyDelivery,
        items: newOrder.items,
        branchInfo: newOrder.branchInfo,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt,
      },
      emergencyDelivery: emergency
        ? `₹${emergencyFee} Emergency Delivery Charges applied`
        : "No Emergency Delivery Charges",
      _id: newOrder._id,
      status: newOrder.status,
      orderSummary: {
        productImage,
        items: orderItems.length,
        itemTotal: totalAmount - emergencyFee,
        deliveryCharges: emergencyFee,
        orderTotal: totalAmount,
      },
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
 
 

//✅ Save for later
const saveForLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const itemToSave = cart.items[itemIndex];

    cart.items.splice(itemIndex, 1);

    cart.savedForLater.push(itemToSave);

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item moved to Save For Later",
      cart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//✅ Move to cart
const moveToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const savedItemIndex = cart.savedForLater.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (savedItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in saved for later",
      });
    }

    //Get saved item
    const savedItem = cart.savedForLater[savedItemIndex];

    const existingCartItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += savedItem.quantity;
    } else {
      cart.items.push({
        productId: savedItem.productId,
        quantity: savedItem.quantity,
        price: savedItem.price,
      });
    }

    cart.savedForLater.splice(savedItemIndex, 1);

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item moved to cart",
      cart,
    });
  } catch (error) {
    console.error("Move to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



module.exports = {
  addToCart,
  getCart,
  incrementCartItem,
  decrementCartItem,
  removeFromCart,
  BuyOrderFromCart,
  saveForLater,
  moveToCart,
}
