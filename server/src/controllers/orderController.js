import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items are required" });
  }

  // Pre-carica i prodotti per validazione base (esistenza + metadata).
  // Il check di stock NON è qui: lo facciamo atomicamente più sotto via $inc condizionato.
  const normalizedItems = [];
  const decrements = []; // per eventuale rollback

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
    }

    const quantity = Number(item.quantity) || 1;

    // Decremento atomico: passa solo se lo stock corrente è ≥ quantity.
    // Evita race condition tra ordini paralleli sullo stesso prodotto.
    const updated = await Product.findOneAndUpdate(
      { _id: product._id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true },
    );

    if (!updated) {
      // Rollback delle decrementazioni già applicate in questo ordine.
      await Promise.all(
        decrements.map(({ productId, quantity: q }) =>
          Product.findByIdAndUpdate(productId, { $inc: { stock: q } }),
        ),
      );
      throw Object.assign(
        new Error(`Insufficient stock for "${product.title}" (richiesti ${quantity}, disponibili ${product.stock})`),
        { statusCode: 400 },
      );
    }

    decrements.push({ productId: product._id, quantity });

    // Ricalcola inStock coerentemente allo stock residuo (il $inc bypassa il pre-validate).
    if (updated.stock === 0 && updated.inStock) {
      await Product.findByIdAndUpdate(updated._id, { inStock: false });
    }

    const unitPrice = product.isOnSale && product.salePrice
      ? product.salePrice
      : product.finalPrice;

    normalizedItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      quantity,
      unitPrice,
      subtotal: Number((unitPrice * quantity).toFixed(2)),
    });
  }

  const totalAmount = Number(
    normalizedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );

  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      totalAmount,
    });
  } catch (orderError) {
    // Se la creazione ordine fallisce, rollback stock per non perdere inventario.
    await Promise.all(
      decrements.map(({ productId, quantity }) =>
        Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } }),
      ),
    );
    throw orderError;
  }

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
