import asyncHandler from "express-async-handler";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.search
    ? { name: { $regex: req.query.search, $options: "i" } }
    : {};
  const count = await Category.countDocuments({ ...keyword });
  const categories = await Category.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("parentCategory");
  res.json({
    data: categories,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});
// GET /api/categories/:id
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "parentCategory"
  );

  if (category) return res.json(category);
  res.status(404);
  throw new Error("Category not found");
});
// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parentCategory } = req.body;

  const category = new Category({ name, slug, description, parentCategory });

  const created = await category.save();
  res.status(201).json(created);
});
// PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Use Object.assign and save to apply and persist updates
  Object.assign(category, req.body);

  const updated = await category.save();
  res.json(updated);
});
// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if any product is using this category
  const productExists = await Product.findOne({ category: categoryId });

  if (productExists) {
    res.status(400);
    throw new Error(
      "Cannot delete this category because it is assigned to one or more products."
    );
  }

  // Safe to delete
  await Category.findByIdAndDelete(categoryId);

  res.json({ message: "Category deleted successfully." });
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
