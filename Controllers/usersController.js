const User = require("./../Models/usersModel");
const AppError = require("./../utils/App.Error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      throw new AppError("No users Found", 404);
    }
    res.status(200).send({
      status: "success",
      message: "Users retrieved successfully",
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
      throw new AppError("No User Found", 404);
    }
    res.status(200).send({
      status: "success",
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = await User.create({
      name,
      email,
      role: "user",
      password: hashedPassword,
    });
    res.status(200).send({
      status: "success",
      message: "Signup successfull",
      data: {
        user: newUser,
      },
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
      throw new AppError("User Not Found with This ID", 404);
    }
    res.status(200).send({
      status: "success",
      data: { updateUser },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError("User Not Found with This ID", 404);
    }
    res.status(200).send({
      status: "success",
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("email or password is Invalid", 404);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("email or password is Invalid", 404);
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      status: "success",
      message: "Login Successful",
      data: { accessToken },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) throw new AppError("No refresh token provided", 401);
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN,
      async (error, decoded) => {
        if (error) throw new AppError("Forbidden", 403);
        const user = await User.findById(decoded.id).exec();
        if (!user) throw new AppError("Unauthorized", 401);
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });
        res.status(200).send({
          status: "success",
          message: "Access Token generated again successfully",
          data: { accessToken },
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
