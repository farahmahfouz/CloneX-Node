const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getOneUser,
  signup,
  login,
  updateUser,
  deleteUser,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
} = require('./../Controllers/usersController');
const { auth } = require('../Middlewares/authMiddleware');

router.get('/', getAllUsers);
router.get('/me', auth, getMe, getOneUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/refresh', refresh);
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

module.exports = router;
