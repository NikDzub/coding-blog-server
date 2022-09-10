import express from 'express';

import { checkAuth, checkUser } from '../utils/index.js';

import {
  getUser,
  followUser,
  getNotifications,
} from '../controllers/profileController.js';

const router = express.Router();

router.route('/notifications').get(checkAuth, getNotifications);
router.route('/:username').get(checkUser, getUser);
router.route('/:username').post(checkAuth, followUser);

export default router;
