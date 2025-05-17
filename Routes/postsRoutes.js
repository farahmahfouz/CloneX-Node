const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getUserPost,
} = require('./../Controllers/postsController');
const { auth } = require('../Middlewares/authMiddleware');
const { uploadImages, handleImages } = require('../utils/images');
const { validate } = require('../validation/userValidation');
const { postSchema } = require('../validation/postValidation');
const likesRoute = require('../Routes/likesRoutes');

router.use('/:postId/likes', likesRoute);

router.get('/', auth, getAllPosts);
router.get('/me', auth, getUserPost);
router.post(
  '/',
  auth,
  uploadImages([{ name: 'images', count: 3 }]),
  handleImages('images'),
  validate(postSchema),
  createPost
);
router.get('/:id', getPostById);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
