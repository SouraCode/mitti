import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, min: 0, required: true },
    startsAt: Date,
    endsAt: Date,
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);
schema.index({ product: 1, enabled: 1, startsAt: 1, endsAt: 1 });
export default mongoose.model('Offer', schema);
