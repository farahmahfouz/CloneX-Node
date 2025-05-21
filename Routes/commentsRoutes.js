const { Router } = require('express');
const router = Router({ mergeParams: true });
const { auth } = require('../Middlewares/authMiddleware');
const {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require('../Controllers/commentsController');

router.use(auth);

router.post('/', createComment);

router.get('/', getAllComments);

router.get('/:id', getCommentById);

router.patch('/:id', updateComment);

router.delete('/:id', deleteComment);

module.exports = router;
