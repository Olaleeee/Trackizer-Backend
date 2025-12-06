const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

//SIGN JWT (ACESSS TOKEN)
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//SEND JWT AND REFRESH TOKEN
const createSendToken = async function (
  user,
  res,
  statusCode,
  message
) {
  const refreshToken = user.createRefreshToken();

  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production"
      ? "your-frontend-domain.vercel.app"
      : "localhost",
    path: "/",
  });

  const accessToken = signToken(user._id, user.role);


  res.status(statusCode).json({
    status: 'success',
    message: message || ' ',
    statusCode,
    data: {
      accessToken,
      user: message === 'new token' ? undefined : user,
    },
  });
};

//LOG USER OUT
const revokeRefreshToken = async function (res, message) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development' && false,
    sameSite: 'Strict',
    path: '/',
  });

  res.status(200).json({
    status: 'success',
    message: message || ' ',
  });
};

exports.signup = catchAsync(async function (req, res, next) {
  const { email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    email,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, res, 201, 'Account created successfully');
});

exports.signin = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('email and password required', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, res, 200, 'Signed in succesfully');
});

exports.signout = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user._id);
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  await user.save({ validateBeforeSave: false });

  revokeRefreshToken(res, 'signed out!');
});

exports.protect = catchAsync(async function (req, res, next) {
  let token = req.headers?.authorization;

  if (
    !token ||
    !token.startsWith('Bearer') ||
    token.includes('undefined') ||
    token.includes('null')
  ) {
    return next(new AppError('Login to get access!', 401));
  }

  token = token.split(' ')[1];

  const decoded = await new Promise((res, _) =>
    res(jwt.verify(token, process.env.JWT_SECRET))
  );

  const activeUser = await User.findOne({
    _id: decoded.id,
    active: { $ne: false },
  });

  if (!activeUser)
    return next(new AppError('User no longer exist', 401));

  if (activeUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        'User recently changed password! Login again.',
        401
      )
    );


  req.user = {
    _id: activeUser._id,
    email: activeUser.email,
    settings: activeUser.settings,
  };

  next();
});

exports.refresh = catchAsync(async function (req, res, next) {
  const token = req?.cookies?.refreshToken;
  if (!token)
    return next(new AppError('Token Expired, login again!', 401));

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const currentUser = await User.findOne({
    refreshToken: hashedToken,
    refreshTokenExpires: { $gte: Date.now() },
  });

  if (!currentUser)
    return next(new AppError('Nice try hacker!', 401));

  createSendToken(currentUser, res, 200, 'new token');
});

exports.me = catchAsync(async function (req, res, next) {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const { email } = req.body;

  if (!email)
    return next(new AppError('Please provide your email', 400));

  const user = await User.findOne({
    email,
    // refreshToken: { $eq: undefined },
  });

  if (!user) return next(new AppError('Email does not exist!'));
  const passwordResetCode = user.createPasswordResetCode();
  await user.save({ validateBeforeSave: false });

  // sendEmail(passwordResetToken);

  res.status(200).json({
    status: 'success',
    message: 'Reset code has been sent to your email',
    data: {
      passwordResetCode,
    },
  });
});

exports.confirmResetCode = catchAsync(
  async function (req, res, next) {
    const resetCode = req.params?.code;

    if (!resetCode) return next(new AppError('no code provided!'));
    const passwordResetCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    const user = await User.findOne({
      email: req.body.email,
      passwordResetCode,
      passwordResetCodeExpires: { $gte: Date.now() },
    }).select('+password');

    if (!user)
      return next(new AppError('Invalid Password Reset Code', 400));

    user.isValidPasswordResetCode = true;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'code confirmed successfully, Create a New Password',
    });
  }
);

exports.resetPassword = catchAsync(async function (req, res, next) {
  const user = await User.findOne({
    email: req.body.email,
    isValidPasswordResetCode: true,
    passwordResetCodeExpires: { $gte: Date.now() },
  }).select('+password');

  if (!user) return next(new AppError('Nice try hacker', 400));

  let { password, passwordConfirm } = req.body;
  password = password.trim();
  passwordConfirm = passwordConfirm.trim();

  if (!password || !passwordConfirm)
    return next(
      new AppError('Password cannot be same as old password')
    );

  if (await user.sameOldPassword(password, user.password))
    return next(new AppError('use a new strong password!'));

  if (!user.isPasswordResetCodeConfirm) user.password = password;
  user.passwordConfirm = passwordConfirm;

  user.passwordResetCode =
    user.passwordResetCodeExpires =
    user.isValidPasswordResetCode =
    undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

exports.newPassword = catchAsync(async function (req, res, next) { });
