const User = require("./../Models/usersModel");
const AppError = require("./../utils/App.Error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const Joi = require("joi");

// const schema = Joi.object({
//   email: Joi.string().email(),
//   password: Joi.string().alphanum(),  
//   role: Joi.string().valid("admin", "user").optional() 
// });

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();
  if (!users) {
    throw new AppError("No users Found", 404);
  }
  res.status(200).send({
    status: "success",
    data: { users },
  });
};

exports.getOneUser = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("No User Found", 404);
  }
  res.status(200).send({
    status: "success",
    data: { user },
  });
};

exports.signup = async (req, res, next) => {
  // await schema.validateAsync(req.body, { abortEarly: false });
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
    data: {
      user: newUser,
    },
  });
};

exports.updateUser = async (req, res, next) => {
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
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError("User Not Found with This ID", 404);
  }
  res.status(200).send({
    status: "success",
    data: {}
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({email});
  if(!user){
    throw new AppError("email or password is Invalid", 404)
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    throw new AppError("email or password is Invalid", 404)
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
  res.status(200).send({
    status: "success",
    message: "Login Successful",
    data: { token, role: user.role },
  });
};
