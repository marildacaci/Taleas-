const asyncHandler = require("../utils/asyncHandler");
const clubService = require("../services/clubService");

function normPlans(plans) {
  if (!Array.isArray(plans)) return [];
  return plans
    .map((p) => ({
      name: String(p?.name || "").trim(),
      durationDays: Number(p?.durationDays ?? 0),
      price: Number(p?.price ?? 0),
      maxActivities: Number(p?.maxActivities ?? 0),
    }))
    .filter((p) =>
      p.name &&
      Number.isFinite(p.durationDays) && p.durationDays >= 1 &&
      Number.isFinite(p.price) && p.price >= 0 &&
      Number.isFinite(p.maxActivities) && p.maxActivities >= 1
    );
}

function normString(v, def = "") {
  if (v === undefined || v === null) return def;
  return String(v).trim();
}

function normType(v) {
  const t = normString(v, "");
  const allowed = new Set(["fitness", "dance", "coding"]);
  return allowed.has(t) ? t : null;
}

exports.listPublic = asyncHandler(async (req, res) => {
  const clubs = await clubService.listClubs({ isPublic: true });
  res.json({ ok: true, data: clubs });
});


exports.listAllAdmin = asyncHandler(async (req, res) => {
  const { type, q, isPublic } = req.query;

  const parsedIsPublic =
    typeof isPublic === "string" ? isPublic === "true" : undefined;

  const clubs = await clubService.listClubs({
    type: type || undefined,
    q: q || undefined,
    isPublic: typeof parsedIsPublic === "boolean" ? parsedIsPublic : undefined
  });

  res.json({ ok: true, data: clubs });
});

exports.getOneAdmin = asyncHandler(async (req, res) => {
  const club = await clubService.getClubById(req.params.id);
  res.json({ ok: true, data: club });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, type } = req.body || {};
  if (!name || !type) {
    return res
      .status(400)
      .json({ ok: false, error: "name and type are required" });
  }

  const safeType = normType(type);
  if (!safeType) {
    return res.status(400).json({ ok: false, error: "Invalid club type" });
  }

  const club = await clubService.createClub({
    name: normString(name),
    type: safeType,
    description: normString(req.body?.description, ""),
    address: normString(req.body?.address, ""),
    coverImage: normString(req.body?.coverImage, ""),
    isPublic: Boolean(req.body?.isPublic),
    plans: normPlans(req.body?.plans),
    createdBy: req.auth?.sub || null,
    updatedBy: req.auth?.sub || null
  });

  res.status(201).json({ ok: true, data: club });
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "type",
    "description",
    "address",
    "coverImage",
    "isPublic",
    "plans"
  ];

  const patch = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }

  if (patch.name !== undefined) patch.name = normString(patch.name);

  if (patch.type !== undefined) {
    const safeType = normType(patch.type);
    if (!safeType) {
      return res.status(400).json({ ok: false, error: "Invalid club type" });
    }
    patch.type = safeType;
  }

  if (patch.description !== undefined)
    patch.description = normString(patch.description, "");
  if (patch.address !== undefined) patch.address = normString(patch.address, "");
  if (patch.coverImage !== undefined)
    patch.coverImage = normString(patch.coverImage, "");

  if (patch.plans !== undefined) patch.plans = normPlans(patch.plans);

  patch.updatedBy = req.auth?.sub || null;

  const club = await clubService.updateClub(req.params.id, patch);
  res.json({ ok: true, data: club });
});

exports.setVisibility = asyncHandler(async (req, res) => {
  const { isPublic } = req.body || {};
  if (typeof isPublic !== "boolean") {
    return res.status(400).json({ ok: false, error: "isPublic must be boolean" });
  }

  const club = await clubService.setClubVisibility(req.params.id, isPublic, {
    updatedBy: req.auth?.sub || null
  });

  res.json({ ok: true, data: club });
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await clubService.deleteClub(req.params.id);

  if (!deleted) {
    return res.status(404).json({ ok: false, error: "Club not found" });
  }

  return res.status(200).json({
    ok: true,
    message: "Club deleted",
    data: { id: String(deleted._id) }
  });
});

