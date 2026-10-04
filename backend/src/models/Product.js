import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    providerId: String,
    alt: { type: String, trim: true, maxlength: 180 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    shortDescription: { type: String, maxlength: 350, default: '' },
    description: { type: String, default: '' },
    ingredients: { type: [String], default: [] },
    directions: { type: String, default: '' },
    images: { type: [imageSchema], default: [] },
    regularPrice: { type: Number, min: 0, required: true },
    stockQuantity: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);
schema.index({ name: 'text', shortDescription: 'text', category: 'text' });
export default mongoose.model('Product', schema);
