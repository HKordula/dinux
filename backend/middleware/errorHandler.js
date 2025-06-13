const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] Error:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { errorHandler, notFound };