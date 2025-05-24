const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getOneUser,
  updateMe,
  deleteUser,
  getMe,
  updatePassword,
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
const { uploadImages, handleMultipleImages } = require('../utils/images');
const { addFollow, unFollow, getMyFollowStats, getUserFollowStats } = require('../Controllers/followController');

router.get('/', getAllUsers);

router.get('/me', auth, getMe, getOneUser);
router.patch(
  '/updateMe',
  auth,
  uploadImages([
    { name: 'image', count: 1 },
    { name: 'coverImage', count: 1 },
  ]),
  handleMultipleImages(['image', 'coverImage']),
  updateMe
);
router.patch('/updateMyPassword', auth, updatePassword);
router.delete('/:id', deleteUser);

router.post('/refresh', refresh);
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);


router.use(auth)

router.post('/:id/follow', addFollow);

router.post('/:id/follow', unFollow);

router.get('/follow', getMyFollowStats)

router.get('/:id/follow', getUserFollowStats)

module.exports = router;
