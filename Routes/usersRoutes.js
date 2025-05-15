const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  getMe,
} = require('./../Controllers/usersController');
const {
  signup,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} = require('../Controllers/authController');
const { auth } = require('../Middlewares/authMiddleware');
const {
  validate,
  signupSchema,
  loginSchema,
} = require('../validation/userValidation');

router.get('/', getAllUsers);
router.get('/me', auth, getMe, getOneUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/refresh', refresh);
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

module.exports = router;
