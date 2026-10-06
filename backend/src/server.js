import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import connectCloudinary from './config/cloudinary.js';

connectCloudinary()
connectDatabase()
  .then(() => app.listen(env.port, () => console.log(`API listening on ${env.port}`)))
  .catch((error) => {
    console.error('Failed to start API', error.message);
    process.exit(1);
  });
