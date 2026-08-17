// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden: You do not have access" });
//     }
//     next();
//   };
// };





const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // console.log('req.user:', req.user);
    // console.log('allowedRoles:', allowedRoles);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have access" });
    }
    next();
  };
};
module.exports = { authorizeRoles };