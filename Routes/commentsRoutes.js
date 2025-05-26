const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getPostComments,
  deleteComment,
  getAllComments,
  getCommentById,
  updateComment,
} = require('../Controllers/commentsController');
const { auth } = require('../Middlewares/authMiddleware');

router.use(auth);

router.get('/', getAllComments);
router.get('/:id', getCommentById);
router.post('/', addComment);
router.patch('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
