export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || res.statusCode || 500;
  const isValidationError = err.name === "ValidationError";
  const isDuplicateKey = err.code === 11000;

  let message = err.message || "Internal server error";

  if (isDuplicateKey) {
    message = "Resource already exists";
  }

  if (isValidationError) {
    message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  res.status(statusCode === 200 ? 500 : statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
