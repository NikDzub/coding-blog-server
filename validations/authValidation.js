import { body } from 'express-validator';

const minUsername = 4;
const minPassword = 4;

const registerValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: minPassword }),
  body('username').isLength({ min: minUsername }),
];

const loginValidation = [
  body('username').isLength({ min: minUsername }),
  body('password').isLength({ min: minPassword }),
];

export const authValidation = { registerValidation, loginValidation };
