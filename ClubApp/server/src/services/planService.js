const Plan = require("../models/Plan");
const Club = require("../models/Club");
const AppError = require("../utils/AppError");

async function createPlan(payload) {
  const clubId = payload?.clubId; // FIX
  if (!clubId) throw new AppError("clubId is required", 400, "VALIDATION_ERROR");

  const club = await Club.findById(clubId).lean();
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  const name = String(payload?.name || "").trim();
  if (!name) throw new AppError("name is required", 400, "VALIDATION_ERROR");

  const durationDays = Number(payload?.durationDays);
  const price = Number(payload?.price);

  if (!Number.isFinite(durationDays) || durationDays < 1) {
    throw new AppError("durationDays must be >= 1", 400, "VALIDATION_ERROR");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new AppError("price must be >= 0", 400, "VALIDATION_ERROR");
  }

  try {
    return await Plan.create({
      clubId,
      name,
      durationDays,
      price,
      currency: payload?.currency || "EUR",
      includedActivities: (payload?.includedActivities || [])
        .map((x) => String(x).trim())
        .filter(Boolean),
      isActive: payload?.isActive ?? true
    });
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Plan name must be unique within club", 409, "CONFLICT", err.keyValue);
    throw err;
  }
}

async function listPlansByClub(clubId, { isActive } = {}) {
  const filter = { clubId };
  if (typeof isActive === "boolean") filter.isActive = isActive;
  return Plan.find(filter).sort({ price: 1 }).lean();
}

async function getPlanById(planId) {
  const plan = await Plan.findById(planId).lean();
  if (!plan) throw new AppError("Plan not found", 404, "NOT_FOUND");
  return plan;
}

async function updatePlan(planId, patch) {
  const safe = { ...patch };
  if (safe.name != null) safe.name = String(safe.name).trim();
  if (safe.includedActivities) {
    safe.includedActivities = safe.includedActivities.map((x) => String(x).trim()).filter(Boolean);
  }

  try {
    const updated = await Plan.findByIdAndUpdate(planId, safe, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) throw new AppError("Plan not found", 404, "NOT_FOUND");
    return updated;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Plan name must be unique within club", 409, "CONFLICT", err.keyValue);
    throw err;
  }
}

async function deactivatePlan(planId) {
  return updatePlan(planId, { isActive: false });
}

async function deletePlan(planId) {
  const deleted = await Plan.findByIdAndDelete(planId).lean();
  if (!deleted) throw new AppError("Plan not found", 404, "NOT_FOUND");
  return deleted;
}

module.exports = {
  createPlan,
  listPlansByClub,
  getPlanById,
  updatePlan,
  deactivatePlan,
  deletePlan
};
