const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { run, get } = require('../database/db');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'trainer' } = req.body;

    const existingUser = await get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastID
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    logger.info(`User logged in: ${user.username}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
