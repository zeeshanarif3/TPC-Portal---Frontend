/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Expects req.user to be set by verifyToken middleware.
 * 
 * @param {...string} allowedRoles - The roles permitted to access the route
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = { roleGuard };
