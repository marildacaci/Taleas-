module.exports = function requireSelfOrAdmin(paramName = "userId") {
  return (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" }
      });
    }

    const targetId = String(req.params[paramName] || "");
    const isSelf = String(req.user.id) === targetId;
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        ok: false,
        error: { code: "FORBIDDEN", message: "You can only access your own data" }
      });
    }

    next();
  };
};
