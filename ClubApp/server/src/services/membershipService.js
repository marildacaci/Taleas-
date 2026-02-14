const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const User = require("../models/User");
const Club = require("../models/Club");
const Plan = require("../models/Plan");
const AppError = require("../utils/AppError");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
}

async function createMembership({ userId, clubId, planId, startAt = new Date() }, { session } = {}) {

    const [user, club, plan] = await Promise.all([
    User.findById(userId).session(session || null).lean(),
    Club.findById(clubId).session(session || null).lean(),
    Plan.findById(planId).session(session || null).lean()
  ]);

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");
  if (!plan) throw new AppError("Plan not found", 404, "NOT_FOUND");
  if (String(plan.clubId) !== String(clubId)) {
    throw new AppError("Plan does not belong to this club", 400, "VALIDATION_ERROR");
  }
  if (!plan.isActive) throw new AppError("Plan is not active", 400, "VALIDATION_ERROR");

  const existingActive = await Membership.findOne({ userId, clubId, status: "active" })
    .session(session || null)
    .lean();

  if (existingActive) throw new AppError("Active membership already exists", 409, "CONFLICT");

  const start = new Date(startAt);
  const end = addDays(start, plan.durationDays);

  try {
    return await Membership.create(
      [{ userId, clubId, planId, startAt: start, endAt: end, status: "active" }],
      { session }
    ).then((docs) => docs[0]);
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Active membership already exists", 409, "CONFLICT");
    throw err;
  }
}

async function cancelMembership({ userId, clubId }) {
  const m = await Membership.findOneAndUpdate(
    { userId, clubId, status: "active" },
    { status: "canceled" },
    { new: true }
  ).lean();

  if (!m) throw new AppError("Active membership not found", 404, "NOT_FOUND");
  return m;
}

async function expireMembershipsJob(now = new Date()) {
  const res = await Membership.updateMany(
    { status: "active", endAt: { $lt: now } },
    { $set: { status: "expired" } }
  );
  return res; 
}

async function getUserMemberships(userId) {
  return Membership.find({ userId }).sort({ createdAt: -1 }).lean();
}

module.exports = {createMembership, cancelMembership, expireMembershipsJob, getUserMemberships};