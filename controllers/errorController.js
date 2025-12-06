const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const keyValue = Object.entries(err.keyValue).flat();

  const message = `${keyValue[0].toUpperCase()}: ${keyValue[1]} exists. Try another ${keyValue[0]}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const value = Object.values(error.errors).join('. ');
  const message = `${value}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid login credentials!', 400);

const handleJWTExpiredError = () =>
  new AppError('Token Expired, login again', 401);

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (res, err) => {
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  res.status(500).json({
    status: 'error',
    message: 'something went wrong...',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log('this is err: ', err);

  if (process.env.NODE_ENV === 'development') sendErrorDev(res, err);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    console.log(err);
    sendErrorProd(res, error);
  }
};
