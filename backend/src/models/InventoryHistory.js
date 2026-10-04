import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    oldQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);
export default mongoose.model('InventoryHistory', schema);
