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
const commentsRoute = require('../Routes/commentsRoutes');

router.use('/:postId/likes', likesRoute);
router.use('/:postId/comments', commentsRoute);

router.use(auth)

router.get('/', getAllPosts);
router.get('/me', getUserPost);
router.post(
  '/',
  uploadImages([{ name: 'images', count: 3 }]),
  handleImages('images'),
  validate(postSchema),
  createPost
);
router.get('/:id', getPostById);
router.patch('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
