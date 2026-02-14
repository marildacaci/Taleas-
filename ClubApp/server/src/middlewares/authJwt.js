const jwt = require("jsonwebtoken");

module.exports = function authJwt(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    req.user = null; 
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role || "user"
    };
    next();
  } catch (e) {
    return res.status(401).json({
      ok: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" }
    });
  }
};
