function requireAdmin(req, res, next) {
  const groups = req.user?.["cognito:groups"] || [];

  if (!Array.isArray(groups) || !groups.includes("admin")) {
    return res.status(403).json({ ok: false, error: "Admin only" });
  }

  next();
}

module.exports = { requireAdmin };
