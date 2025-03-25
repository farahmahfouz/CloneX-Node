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

router.get('/', getAllPosts);
router.get('/me', auth, getUserPost);
router.post('/', auth, createPost);
router.get('/:id', getPostById);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
