import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: {
      url: String,
      providerId: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Category', schema);
