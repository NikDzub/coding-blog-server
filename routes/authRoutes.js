import express from 'express';

import { validationErrorHandler } from '../utils/index.js';
import { validations } from '../validations/index.js';
import { checkAuth } from '../utils/index.js';

import { register, login, getMe } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/register')
  .post(
    validations.authValidation.registerValidation,
    validationErrorHandler,
    register
  );

router
  .route('/login')
  .post(
    validations.authValidation.loginValidation,
    validationErrorHandler,
    login
  );

router.route('/').get(checkAuth, getMe);

export default router;
