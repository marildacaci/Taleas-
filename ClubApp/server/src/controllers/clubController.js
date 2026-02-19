const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Club = require("../models/Club");
const catalog = require("../catalog/clubCatalog");

function normalizePlans(plans) {
  if (!Array.isArray(plans)) return [];
  return plans.map((p) => ({
    name: String(p?.name || "").trim(),
    durationDays: Number(p?.durationDays),
    price: Number(p?.price),
    maxActivities: Number(p?.maxActivities)
  }));
}

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return activities.map((x) => String(x || "").trim()).filter(Boolean);
}

exports.listPublic = asyncHandler(async (req, res) => {
  const clubs = await Club.find({ isPublic: true }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, data: clubs });
});

exports.listAllAdmin = asyncHandler(async (req, res) => {
  const clubs = await Club.find({}).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, data: clubs });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, type, address, coverImage, isPublic } = req.body || {};

  if (!name || !type) throw new AppError("name and type are required", 400, "VALIDATION_ERROR");

  const t = String(type).trim();
  const tpl = catalog[t];
  if (!tpl) throw new AppError("Invalid club type", 400, "VALIDATION_ERROR");

  const club = await Club.create({
    name: String(name).trim(),
    type: t,
    description: String(tpl.description || "").trim(),
    address: String(address || "").trim(),
    coverImage: String(coverImage || "").trim(),
    isPublic: Boolean(isPublic),
    plans: normalizePlans(tpl.plans),
    activities: normalizeActivities(tpl.activities)
  });

  res.status(201).json({ ok: true, data: club });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const club = await Club.findById(id);
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  const patch = req.body || {};

  if (patch.name !== undefined) club.name = String(patch.name).trim();
  if (patch.address !== undefined) club.address = String(patch.address || "").trim();
  if (patch.coverImage !== undefined) club.coverImage = String(patch.coverImage || "").trim();
  if (patch.isPublic !== undefined) club.isPublic = Boolean(patch.isPublic);

  if (patch.type !== undefined) {
    const t = String(patch.type).trim();
    const tpl = catalog[t];
    if (!tpl) throw new AppError("Invalid club type", 400, "VALIDATION_ERROR");
    club.type = t;
    club.description = String(tpl.description || "").trim();
    club.plans = normalizePlans(tpl.plans);
    club.activities = normalizeActivities(tpl.activities);
  }

  await club.save();
  res.json({ ok: true, data: club });
});

exports.setVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body || {};

  const club = await Club.findById(id);
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  club.isPublic = Boolean(isPublic);
  await club.save();

  res.json({ ok: true, data: club });
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const club = await Club.findById(id);
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  await club.deleteOne();
  res.json({ ok: true });
});
