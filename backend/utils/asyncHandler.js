const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(error => {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  });
};
export default asyncHandler;