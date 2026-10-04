import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    slug: String,
    sku: String,
    image: String,
    unitPrice: { type: Number, min: 0 },
    quantity: { type: Number, min: 1 },
  },
  { _id: false }
);
const schema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    deliveryAddress: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    subtotal: Number,
    total: Number,
    estimatedDeliveryAt: Date,
    deliveredAt: Date,
    paymentState: { type: String, enum: ['pending', 'paid', 'failed', 'cod'], default: 'pending' },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);
export default mongoose.model('Order', schema);
