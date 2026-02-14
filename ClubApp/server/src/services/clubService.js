const Club = require("../models/Club");
const Membership = require("../models/Membership");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { notify } = require("./notificationService");

async function createClub(input) {
  const name = String(input?.name || "").trim();
  const type = input?.type;

  if (!name || !type) throw new AppError("Name and type are required", 400, "VALIDATION_ERROR");

  try {
    return await Club.create({
      name,
      type,
      description: input?.description ?? "",
      address: input?.address ?? "",
      isPublic: input?.isPublic ?? true
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw new AppError("Club name must be unique", 409, "CONFLICT", err.keyValue);
    }
    throw err;
  }
}

async function listClubs({ type, isPublic, q } = {}) {
  const filter = {};
  if (type) filter.type = type;
  if (typeof isPublic === "boolean") filter.isPublic = isPublic;

  if (q) {
    const rx = new RegExp(String(q).trim(), "i");
    filter.$or = [{ name: rx }, { address: rx }, { description: rx }];
  }

  return Club.find(filter).sort({ createdAt: -1 }).lean();
}

async function getClubById(id) {
  const club = await Club.findById(id).lean();
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");
  return club;
}

async function updateClub(id, patch) {
  const safe = { ...patch };
  if (safe.name != null) safe.name = String(safe.name).trim();

  try {
    const updated = await Club.findByIdAndUpdate(id, safe, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) throw new AppError("Club not found", 404, "NOT_FOUND");
    return updated;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Club name must be unique", 409, "CONFLICT", err.keyValue);
    throw err;
  }
}

async function setClubVisibility(id, isPublic) {
  return updateClub(id, { isPublic: Boolean(isPublic) });
}

async function deleteClub(id) {
  const club = await Club.findById(id).lean();
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  const hasActive = await Membership.exists({ clubId: id, status: "active" });
  if (hasActive) {
    throw new AppError(
      "Cannot delete club while it has active memberships",
      400,
      "CLUB_HAS_ACTIVE_MEMBERSHIPS"
    );
  }

  const memberships = await Membership.find({ clubId: id }).select("userId").lean();
  const userIds = [...new Set(memberships.map((m) => String(m.userId)))];

  const members = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("email firstName lastName").lean()
    : [];

  const deleted = await Club.findByIdAndDelete(id).lean();

  notify("CLUB_DELETED", { members, clubName: club.name }, { async: true });

  return deleted;
}

module.exports = {
  createClub,
  listClubs,
  getClubById,
  updateClub,
  deleteClub,
  setClubVisibility
};
