const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Your user model

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    // 1. Get token from header or cookie
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JSONWEB_TOKEN_SECRET);

      // 3. Fetch fresh user data (excluding password)
      const user = await User.findById(decoded._id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User account not found'
        });
      }

      // 4. Role-based access control (if roles specified)
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access restricted to: ${roles.join(', ')}`
        });
      }

      // 5. Attach user to request
      req.user = user;
      next();

    } catch (err) {
      // 6. Handle specific JWT errors
      let error = 'Invalid token';
      if (err.name === 'TokenExpiredError') error = 'Session expired. Please log in again';
      if (err.name === 'JsonWebTokenError') error = 'Malformed token';

      res.status(401).json({
        success: false,
        error
      });
    }
  };
};

module.exports = authMiddleware;