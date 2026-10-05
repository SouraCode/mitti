import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
import { uploadImage } from '../services/imageService.js';

export async function listCategories(req, res) {
  res.json({ categories: await Category.find().sort({ name: 1 }).lean() });
}

export async function createCategory(req, res) {
  const name = req.validated.body.name.trim();
  const exists = await Category.exists({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (exists) throw new ApiError(409, 'This category already exists.');
  const category = await Category.create({ name, slug: slugify(name) });
  res.status(201).json({ category });
}

export async function uploadCategoryImage(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  if (!req.file) throw new ApiError(400, 'Select one category image.');
  category.image = await uploadImage(req.file, `mitti-rituals/categories/${category._id}`, req);
  await category.save();
  res.json({ category });
}

export async function removeCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  res.status(204).end();
}
