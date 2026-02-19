const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.me = asyncHandler(async (req, res) => {
  if (!req.auth?.sub) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }

  const user =
    req.user ||
    (await User.findOne({ cognitoSub: req.auth.sub }).lean());

  res.json({
    ok: true,
    data: {
      auth: req.auth,
      user: user || null
    }
  });
});

exports.upsertProfile = asyncHandler(async (req, res) => {
  if (!req.auth?.sub) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }

  const { firstName, lastName, phoneNumber, age } = req.body || {};

  const update = {};
  if (firstName !== undefined) update.firstName = String(firstName).trim();
  if (lastName !== undefined) update.lastName = String(lastName).trim();

  if (phoneNumber !== undefined) {
    const pn = String(phoneNumber).trim();
    update.phoneNumber = pn.length ? pn : null;
  }

  if (age !== undefined) {
    const n = Number(age);
    if (!Number.isFinite(n) || n < 18) {
      throw new AppError("Age must be 18+", 400, "VALIDATION_ERROR");
    }
    update.age = n;
  }

  if (req.auth.email) update.email = String(req.auth.email).toLowerCase().trim();
  if (req.auth.username) update.username = String(req.auth.username).trim();

  const user = await User.findOneAndUpdate(
    { cognitoSub: req.auth.sub },
    {
      $set: update,
      $setOnInsert: { role: "user", cognitoSub: req.auth.sub }
    },
    { new: true, upsert: true }
  ).lean();

  res.status(200).json({ ok: true, data: user });
});

exports.localAuthNotUsed = asyncHandler(async (req, res) => {
  res.status(410).json({
    ok: false,
    error: { code: "GONE", message: "Local auth endpoints are disabled. Use Cognito in the frontend." }
  });
});
