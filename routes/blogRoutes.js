import express from 'express';

import { validationErrorHandler, checkAuth } from '../utils/index.js';
import { validations } from '../validations/index.js';

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  commentPost,
  deleteComment,
  likePostToggle,
  getTags,
  clearAll,
} from '../controllers/blogController.js';

const router = express.Router();

router.route('/clearall').get(clearAll);

router.route('/').get(getPosts);
router.route('/tags').get(getTags);
router.route('/:id').get(getPost);

router
  .route('/')
  .post(
    checkAuth,
    validations.blogValidation.postValidation,
    validationErrorHandler,
    createPost
  );

router
  .route('/:id')
  .patch(checkAuth, validations.blogValidation.postValidation, updatePost);

router.route('/:id').delete(checkAuth, deletePost);

router
  .route('/comment/:id')
  .post(checkAuth, validations.blogValidation.commentValidation, commentPost);

router.route('/comment/:id').patch(checkAuth, deleteComment);

router.route('/like/:id').patch(checkAuth, likePostToggle);

export default router;
