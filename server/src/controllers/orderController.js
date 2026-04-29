import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

export const createOrder = asyncHandler(async (req, res) => {
  console.log("Received request body:", req.body);
  console.log("User:", req.user);
  
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items are required" });
  }

  const normalizedItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
      }

      const quantity = Number(item.quantity) || 1;
      const unitPrice = product.finalPrice;

      return {
        product: product._id,
        title: product.title,
        image: product.image,
        quantity,
        unitPrice,
        subtotal: Number((unitPrice * quantity).toFixed(2)),
      };
    })
  );

  const totalAmount = Number(
    normalizedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
  );

  const order = await Order.create({
    user: req.user._id,
    items: normalizedItems,
    totalAmount,
  });

  const populatedOrder = await order.populate("user", "name email");
  sendOrderConfirmationEmail(populatedOrder.user, populatedOrder);

  res.status(201).json(populatedOrder);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});
