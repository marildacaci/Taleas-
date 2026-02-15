const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

exports.register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ ok: true, data });
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ ok: true, data });
});

exports.refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body);
  res.json({ ok: true, data });
});
