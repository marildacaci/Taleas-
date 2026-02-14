module.exports = function requireAuth(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" }
    });
  }
  next();
};
