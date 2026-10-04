import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    googleId: { type: String, sparse: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
  },
  { timestamps: true }
);
schema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};
schema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};
export default mongoose.model('User', schema);
