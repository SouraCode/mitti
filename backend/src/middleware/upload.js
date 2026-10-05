import multer from 'multer';
import ApiError from '../utils/ApiError.js';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});
export const productImages = (req, res, next) =>
  upload.array('images', 10)(req, res, (error) =>
    next(error ? new ApiError(400, error.message) : null)
  );
export const reviewImages = (req, res, next) =>
  upload.array('images', 5)(req, res, (error) =>
    next(error ? new ApiError(400, error.message) : null)
  );
export const categoryImage = (req, res, next) =>
  upload.single('image')(req, res, (error) => next(error ? new ApiError(400, error.message) : null));
