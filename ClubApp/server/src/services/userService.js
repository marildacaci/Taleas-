const User = require("../models/User");
const Membership = require("../models/Membership");
const AppError = require("../utils/AppError");
const { notify } = require("./notificationService");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return phone ? String(phone).trim() : undefined;
}

async function createUser(input) {
  const firstName = String(input?.firstName || "").trim();
  const lastName = String(input?.lastName || "").trim();
  const email = normalizeEmail(input?.email);
  const phoneNumber = normalizePhone(input?.phoneNumber);

  if (!firstName || !lastName || !email) {
    throw new AppError("firstName, lastName, email are required", 400, "VALIDATION_ERROR");
  }

  const existingEmail = await User.findOne({ email }).lean();
  if (existingEmail) throw new AppError("Email already exists", 409, "CONFLICT", { email });

  if (phoneNumber) {
    const existingPhone = await User.findOne({ phoneNumber }).lean();
    if (existingPhone) throw new AppError("Phone number already exists", 409, "CONFLICT", { phoneNumber });
  }

  try {
    const created = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      age: input?.age ?? null,
      role: input?.role
    });

    notify("ACCOUNT_CREATED", { member: created }, { async: true });

    return created;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Duplicate field value", 409, "CONFLICT", err.keyValue);
    throw err;
  }
}

async function getUserById(id) {
  const user = await User.findById(id).lean();
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return user;
}

async function listUsers({ q, role, limit = 20, page = 1 } = {}) {
  const filter = {};
  if (role) filter.role = role;

  if (q) {
    const rx = new RegExp(String(q).trim(), "i");
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
  }

  const L = Math.min(Math.max(Number(limit), 1), 100);
  const P = Math.max(Number(page), 1);
  const skip = (P - 1) * L;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(L).lean(),
    User.countDocuments(filter)
  ]);

  return { items, total, page: P, limit: L };
}

async function updateUser(id, patch) {
  const safe = { ...patch };
  if (safe.email != null) safe.email = normalizeEmail(safe.email);
  if (safe.firstName != null) safe.firstName = String(safe.firstName).trim();
  if (safe.lastName != null) safe.lastName = String(safe.lastName).trim();
  if (safe.phoneNumber != null) safe.phoneNumber = normalizePhone(safe.phoneNumber);

  try {
    const updated = await User.findByIdAndUpdate(id, safe, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) throw new AppError("User not found", 404, "NOT_FOUND");
    return updated;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Duplicate field value", 409, "CONFLICT", err.keyValue);
    throw err;
  }
}

async function deleteUser(id) {
  const user = await User.findById(id).lean();
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const active = await Membership.findOne({ userId: id, status: "active" }).lean();
  if (active) throw new AppError("User has active membership", 400, "VALIDATION_ERROR");

  const deleted = await User.findByIdAndDelete(id).lean();
  return deleted;
}

async function updateMyProfile(userId, patch) {
  const safe = {};
  if (patch.firstName != null) safe.firstName = String(patch.firstName).trim();
  if (patch.lastName != null) safe.lastName = String(patch.lastName).trim();
  if (patch.phoneNumber != null) safe.phoneNumber = normalizePhone(patch.phoneNumber);
  if (patch.age != null) safe.age = patch.age;

  return updateUser(userId, safe);
}

module.exports = {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
  updateMyProfile
};
