export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}
export function errorHandler(error, req, res, next) {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error(error);
  res
    .status(status)
    .json({
      message: error.message || 'An unexpected error occurred.',
      ...(error.details && { details: error.details }),
    });
}
