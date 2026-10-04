import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema(
  { url: String, providerId: String, alt: String },
  { _id: true }
);
const schema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    body: { type: String, trim: true, maxlength: 1500, default: '' },
    images: { type: [imageSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
      index: true,
    },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);
schema.index({ product: 1, customer: 1 }, { unique: true });
export default mongoose.model('Review', schema);
