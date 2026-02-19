module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth?.sub) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        message: "Authentication required"
      });
    }

    const dbRole = req.user?.role || null;

    const groups = Array.isArray(req.auth?.groups) ? req.auth.groups : [];
    const isAdmin = groups.includes("admin");

    const allowed = allowedRoles.map(String);

    const ok =
      (dbRole && allowed.includes(dbRole)) ||
      (allowed.includes("admin") && isAdmin);

    if (!ok) {
      return res.status(403).json({
        ok: false,
        error: "FORBIDDEN",
        message: "Insufficient permissions"
      });
    }

    next();
  };
};
