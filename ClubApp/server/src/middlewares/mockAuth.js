module.exports = function mockAuth(req, res, next) {
  if (process.env.NODE_ENV === "production") return next();

  req.user = {
    id: req.headers["x-user-id"] || null,
    role: req.headers["x-role"] || "user"
  };
  next();
};
