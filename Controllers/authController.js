const User = require('./../Models/usersModel');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} = require('../utils/jwt');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, dateOfBirth } = req.body;
  const existEmail = await User.findOne({ email });

  if (existEmail) return next(new AppError('Email is already used', 409));
  const newUser = await User.create({ name, email, password, dateOfBirth });

  newUser.password = undefined;
  res.status(200).send({
    status: 'success',
    message: 'Signup successfull',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  const accessToken = signAccessToken(user.id);

  const refreshToken = signRefreshToken(user.id);

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).send({
    status: 'success',
    message: 'Login Successful',
    data: { accessToken },
  });
});

exports.refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken)
    return next(new AppError('No refresh token provided', 401));
  let decoded;

  try {
    decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN);
  } catch (err) {
    return next(new AppError('Forbidden', 403));
  }

  const user = await User.findById(decoded.id).exec();
  if (!user) return next(new AppError('Unauthorized', 401));

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  res.cookie('jwt', newRefreshToken, {
    httpOnly: true,
    secure: true, 
    sameSite: 'Lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).send({
    status: 'success',
    message: 'Access Token generated again successfully',
    data: { accessToken },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('No user found with this email!', 404));

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) have requested a password reset. Please click on the following link to complete the process:\n${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token valid for 10 minutes',
      message,
    });

    res.status(200).send({
      status: 'success',
      message: 'Reset password email sent successfully',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signAccessToken(user.id);
  res.status(200).send({
    status: 'success',
    message: 'Password reset successfully',
    data: { token },
  });
});
