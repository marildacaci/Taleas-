const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

exports.create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ ok: true, data: user });
});

exports.list = asyncHandler(async (req, res) => {
  const data = await userService.listUsers(req.query);
  res.json({ ok: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  res.json({ ok: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body);
  res.json({ ok: true, data });
});

exports.remove = asyncHandler(async (req, res) => {
  const data = await userService.deleteUser(req.params.id);
  res.json({ ok: true, data });
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId; // ose req.user.id kur të kesh auth
  const data = await userService.updateMyProfile(userId, req.body);
  res.json({ ok: true, data });
});
