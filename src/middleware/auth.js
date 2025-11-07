const jwt = require('jsonwebtoken');
const { AuditService } = require('../services/AuditService');

class AuthMiddleware {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  }

  // Middleware to verify JWT token
  authenticate() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          AuditService.logAccessAttempt(null, req.path, false, 'No authorization header');
          return res.status(401).json({ error: 'Authorization header required' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        try {
          const decoded = jwt.verify(token, this.jwtSecret);
          req.user = decoded;
          next();
        } catch (jwtError) {
          AuditService.logAccessAttempt(null, req.path, false, 'Invalid JWT token');
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
      } catch (error) {
        AuditService.logError(error, { path: req.path });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Optional authentication - doesn't fail if no token
  optionalAuthenticate() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          try {
            const decoded = jwt.verify(token, this.jwtSecret);
            req.user = decoded;
          } catch (jwtError) {
            // Ignore invalid token for optional auth
          }
        }
        next();
      } catch (error) {
        AuditService.logError(error, { path: req.path });
        next(); // Don't block for optional auth
      }
    };
  }

  // Generate JWT token for user
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  // Verify token without middleware (for internal use)
  verifyToken(token) {
    return jwt.verify(token, this.jwtSecret);
  }
}

module.exports = AuthMiddleware;