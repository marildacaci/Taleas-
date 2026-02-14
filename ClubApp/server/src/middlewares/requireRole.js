module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: { code: "FORBIDDEN", message: "Insufficient permissions" }
      });
    }

    next();
  };
};
