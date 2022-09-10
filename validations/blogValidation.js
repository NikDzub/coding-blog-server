import { body } from 'express-validator';

const postValidation = [
  body('title').isLength({ min: 3, max: 80 }).isString(),
  body('body').isLength({ min: 3 }).isString(),
  body('tags').isArray({ max: 8 }),
  body('img').optional().isString(),
];

const commentValidation = [
  body('comment').isString(),
  body('reply').optional().isString(),
];

export const blogValidation = { postValidation, commentValidation };
