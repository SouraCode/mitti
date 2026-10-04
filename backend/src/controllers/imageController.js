import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { uploadImage } from '../services/imageService.js';
export async function addProductImages(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  if (!req.files?.length) throw new ApiError(400, 'Select at least one image.');
  if (product.images.length + req.files.length > 10)
    throw new ApiError(400, 'A product can have up to ten images.');
  const images = await Promise.all(
    req.files.map((file) => uploadImage(file, `mitti-rituals/products/${product._id}`, req))
  );
  product.images.push(
    ...images.map((image, index) => ({
      ...image,
      alt: req.body.alts?.[index] || product.name,
      isPrimary: product.images.length === 0 && index === 0,
    }))
  );
  await product.save();
  res.status(201).json({ product });
}
export async function reorderProductImages(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  const ids = req.body.imageIds;
  if (!Array.isArray(ids) || ids.length !== product.images.length)
    throw new ApiError(400, 'Provide every product image in its new order.');
  const images = ids.map((id) => product.images.id(id)).filter(Boolean);
  if (images.length !== product.images.length) throw new ApiError(400, 'An image was not found.');
  product.images = images;
  product.images.forEach((image, index) => {
    image.isPrimary = index === 0;
  });
  await product.save();
  res.json({ product });
}
export async function removeProductImage(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  const image = product.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found.');
  image.deleteOne();
  if (product.images.length) product.images[0].isPrimary = true;
  await product.save();
  res.json({ product });
}
export async function setPrimaryImage(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  const image = product.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found.');
  product.images.forEach((entry) => {
    entry.isPrimary = entry._id.equals(image._id);
  });
  await product.save();
  res.json({ product });
}
