const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role || "user" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: String(user._id), tokenType: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d" }
  );
}

async function register({ firstName, lastName, email, password, phoneNumber, age, role }) {
  email = String(email || "").trim().toLowerCase();
  if (!firstName || !lastName || !email || !password) {
    throw new AppError("firstName, lastName, email, password are required", 400, "VALIDATION_ERROR");
  }
  if (String(password).length < 6) {
    throw new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR");
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) throw new AppError("Email already exists", 409, "CONFLICT", { email });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email,
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
    age: age ?? null,
    role: role || "user",
    passwordHash
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
  email = String(email || "").trim().toLowerCase();
  if (!email || !password) throw new AppError("email and password are required", 400, "VALIDATION_ERROR");

  const user = await User.findOne({ email }).select("+passwordHash").lean();
  if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = jwt.sign(
    { sub: String(user._id), role: user.role || "user" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );

  const refreshToken = jwt.sign(
    { sub: String(user._id), tokenType: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d" }
  );

  // mos kthe passwordHash
  const safeUser = { ...user };
  delete safeUser.passwordHash;

  return { user: safeUser, accessToken, refreshToken };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) throw new AppError("refreshToken is required", 400, "VALIDATION_ERROR");

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (payload.tokenType !== "refresh") {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(payload.sub).lean();
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

module.exports = { register, login, refresh };
