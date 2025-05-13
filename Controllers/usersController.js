const User = require('./../Models/usersModel');
const Post = require('./../Models/postsModel');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { signupSchema, loginSchema } = require('../validation/userValidation');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    if (!users) {
      throw new AppError('No users Found', 404);
    }
    res.status(200).send({
      status: 'success',
      message: 'Users retrieved successfully',
      data: { users },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getOneUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('No User Found', 404);
    }
    res.status(200).send({
      status: 'success',
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );
    if (!updateUser) {
      throw new AppError('User Not Found with This ID', 404);
    }
    res.status(200).send({
      status: 'success',
      data: { updateUser },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.params.id;
    // 1. Update user to be inactive
    await User.findByIdAndUpdate(userId, { active: false }, { session });
    // 2. Delete all posts by that user
    await Post.deleteMany({ userId }, { session });
    // 3. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      status: 'success',
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    // const { error } = signupSchema.validate(req.body, { abortEarly: true });
    // if (error) return next(new AppError(error.details[0].message, 400));

    const { name, email, password, dateOfBirth } = req.body;

    //see if the user exists or not
    const existEmail = await User.findOne({ email });
    if (existEmail)
      return res
        .status(409)
        .send({ status: 'fail', message: 'Email is already used' });
    // create a new user
    const newUser = await User.create({
      name,
      email,
      role: 'user',
      password,
      dateOfBirth,
    });

    res.status(200).send({
      status: 'success',
      message: 'Signup successfull',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // const { error } = loginSchema.validate(req.body, { abortEarly: true });
    // if (error) return next(new AppError(error.details[0].message, 400));

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('email or password is Invalid', 404));
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '50d',
    });
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN,
      {
        expiresIn: '7d',
      }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      status: 'success',
      message: 'Login Successful',
      data: { accessToken },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) throw new AppError('No refresh token provided', 401);
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN,
      async (error, decoded) => {
        if (error) throw new AppError('Forbidden', 403);
        const user = await User.findById(decoded.id).exec();
        if (!user) throw new AppError('Unauthorized', 401);
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '15m',
        });
        res.status(200).send({
          status: 'success',
          message: 'Access Token generated again successfully',
          data: { accessToken },
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

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
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '9d',
  });

  res.status(200).send({
    status: 'success',
    message: 'Password reset successfully',
    data: { token },
  });
};
