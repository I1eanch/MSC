const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authController.login
);

module.exports = router;
