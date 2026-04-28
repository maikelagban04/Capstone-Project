import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFilterOptions = asyncHandler(async (req, res) => {
  // Ottieni tutti i dati aggregati per i filtri
  const aggregation = await Product.aggregate([
    {
      $group: {
        _id: null,
        brands: { $addToSet: "$brand" },
        componentTypes: { $addToSet: "$componentType" },
        minPrice: { $min: "$finalPrice" },
        maxPrice: { $max: "$finalPrice" },
        totalProducts: { $sum: 1 },
      },
    },
  ]);

  if (aggregation.length === 0) {
    return res.json({
      brands: [],
      componentTypes: [],
      minPrice: 0,
      maxPrice: 0,
      totalProducts: 0,
    });
  }

  const data = aggregation[0];

  res.json({
    brands: data.brands.sort(),
    componentTypes: data.componentTypes.sort(),
    minPrice: Math.floor(data.minPrice),
    maxPrice: Math.ceil(data.maxPrice),
    totalProducts: data.totalProducts,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, componentType, brand, minPrice, maxPrice, inStock } = req.query;
  const filters = {};

  if (category) {
    filters.category = new RegExp(`^${category}$`, "i");
  }

  if (componentType) {
    filters.componentType = componentType;
  }

  if (brand) {
    filters.brand = new RegExp(`^${brand}$`, "i");
  }

  if (minPrice || maxPrice) {
    filters.finalPrice = {};
    if (minPrice) filters.finalPrice.$gte = parseFloat(minPrice);
    if (maxPrice) filters.finalPrice.$lte = parseFloat(maxPrice);
  }

  if (inStock === "true") {
    filters.inStock = true;
  } else if (inStock === "false") {
    filters.inStock = false;
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(filters).sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    priceBase,
    markup,
    image,
    category,
    componentType,
    brand,
    model,
    specifications,
    compatibility,
    stock,
  } = req.body;

  const product = await Product.create({
    title,
    description,
    priceBase,
    markup,
    image,
    category,
    componentType,
    brand,
    model,
    specifications,
    compatibility,
    stock,
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const fields = [
    "title",
    "description",
    "priceBase",
    "markup",
    "image",
    "category",
    "componentType",
    "brand",
    "model",
    "specifications",
    "compatibility",
    "stock",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();
  res.json({ message: "Product removed successfully" });
});
