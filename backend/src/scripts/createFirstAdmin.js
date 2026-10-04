import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
const { MONGODB_URI, FIRST_ADMIN_NAME, FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !FIRST_ADMIN_NAME || !FIRST_ADMIN_EMAIL || !FIRST_ADMIN_PASSWORD) {
  console.error(
    'Set MONGODB_URI, FIRST_ADMIN_NAME, FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD before running this command.'
  );
  process.exit(1);
}
if (FIRST_ADMIN_PASSWORD.length < 12) {
  console.error('FIRST_ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}
await mongoose.connect(MONGODB_URI);
if (await User.exists({ role: 'admin' })) {
  console.error('An admin already exists. This setup command can only create the first admin.');
  process.exit(1);
}
const user = new User({
  name: FIRST_ADMIN_NAME,
  email: FIRST_ADMIN_EMAIL.toLowerCase(),
  role: 'admin',
  isEmailVerified: true,
});
await user.setPassword(FIRST_ADMIN_PASSWORD);
await user.save();
console.log('First admin created.');
await mongoose.disconnect();
