const Plan = require("../models/Plan");
const Club = require("../models/Club");
const AppError = require("../utils/AppError");

async function createPlan(payload) {
  const { clubId } = payload;
  if (!clubId) throw new AppError("clubId is required", 400, "VALIDATION_ERROR");

  const club = await Club.findById(clubId).lean();
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  const name = String(payload.name || "").trim();
  if (!name) throw new AppError("name is required", 400, "VALIDATION_ERROR");

  try {
    return await Plan.create({
      ...payload,
      name,
      includedActivities: (payload.includedActivities || []).map((x) => String(x).trim())
    });
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Plan name must be unique within club", 409, "CONFLICT");
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
  if (patch.name) patch.name = String(patch.name).trim();
  if (patch.includedActivities) patch.includedActivities = patch.includedActivities.map((x) => String(x).trim());

  try {
    const updated = await Plan.findByIdAndUpdate(planId, patch, { new: true, runValidators: true }).lean();
    if (!updated) throw new AppError("Plan not found", 404, "NOT_FOUND");
    return updated;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Plan name must be unique within club", 409, "CONFLICT");
    throw err;
  }
}

async function deletePlan(planId) {
  const deleted = await Plan.findByIdAndDelete(planId).lean();
  if (!deleted) throw new AppError("Plan not found", 404, "NOT_FOUND");
  return deleted;
}

module.exports = { createPlan, listPlansByClub, getPlanById, updatePlan, deletePlan };
