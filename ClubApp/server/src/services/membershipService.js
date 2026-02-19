const Membership = require("../models/Membership");
const User = require("../models/User");
const Club = require("../models/Club");
const AppError = require("../utils/AppError");
const { notify } = require("./notificationService");
const { isValidObjectId } = require("mongoose");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
}

function pickPlanFromClub(club, planId) {
  const pid = String(planId);
  const plans = Array.isArray(club?.plans) ? club.plans : [];
  return plans.find((p) => String(p?._id) === pid) || null;
}

async function createMembership({ userId, clubId, planId, selectedActivities = [], startAt = new Date() }) {
  if (!isValidObjectId(userId)) throw new AppError("Invalid userId", 400, "VALIDATION_ERROR");
  if (!isValidObjectId(clubId)) throw new AppError("Invalid clubId", 400, "VALIDATION_ERROR");
  if (!isValidObjectId(planId)) throw new AppError("Invalid planId", 400, "VALIDATION_ERROR");

  const [user, club] = await Promise.all([
    User.findById(userId).lean(),
    Club.findById(clubId).lean()
  ]);

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (!club) throw new AppError("Club not found", 404, "NOT_FOUND");

  const plan = (club.plans || []).find(p => String(p._id) === String(planId));
  if (!plan) throw new AppError("Plan not found for this club", 404, "NOT_FOUND");

  const picked = Array.isArray(selectedActivities)
    ? selectedActivities.map(x => String(x).trim()).filter(Boolean)
    : [];

  const allowed = new Set((club.activities || []).map(a => String(a).trim()));
  for (const a of picked) {
    if (!allowed.has(a)) throw new AppError(`Invalid activity: ${a}`, 400, "VALIDATION_ERROR");
  }

  const max = Number(plan.maxActivities ?? 0);
  if (max > 0 && picked.length > max) {
    throw new AppError(`You can select up to ${max} activities for ${plan.name}`, 400, "VALIDATION_ERROR");
  }
  if (picked.length === 0) {
    throw new AppError("Select at least 1 activity", 400, "VALIDATION_ERROR");
  }

  const start = new Date(startAt);
  const end = addDays(start, plan.durationDays);

  try {
    const docs = await Membership.create([{
      userId, clubId, planId,
      selectedActivities: picked,
      startAt: start, endAt: end,
      status: "active"
    }]);
    return docs[0];
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Active membership already exists", 409, "CONFLICT");
    throw err;
  }
}

async function cancelMembership({ userId, membershipId }, { session } = {}) {
  if (!isValidObjectId(userId)) throw new AppError("Invalid userId", 400, "VALIDATION_ERROR");
  if (!isValidObjectId(membershipId)) throw new AppError("Invalid membershipId", 400, "VALIDATION_ERROR");

  const m = await Membership.findOneAndUpdate(
    { _id: membershipId, userId, status: "active" },
    { $set: { status: "canceled" } },
    { new: true, session }
  ).lean();

  if (!m) throw new AppError("Active membership not found", 404, "NOT_FOUND");
  return m;
}

async function getUserMemberships(userId) {
  if (!isValidObjectId(userId)) throw new AppError("Invalid userId", 400, "VALIDATION_ERROR");
  return Membership.find({ userId }).sort({ createdAt: -1 }).lean();
}

async function getMyActiveMembership({ userId, clubId }) {
  if (!isValidObjectId(userId)) throw new AppError("Invalid userId", 400, "VALIDATION_ERROR");
  if (!isValidObjectId(clubId)) throw new AppError("Invalid clubId", 400, "VALIDATION_ERROR");

  return Membership.findOne({ userId, clubId, status: "active" }).lean();
}

async function expireMembershipsJob(now = new Date()) {
  const res = await Membership.updateMany(
    { status: "active", endAt: { $lte: now } },
    { $set: { status: "expired" } }
  );
  return { modified: res.modifiedCount ?? res.nModified ?? 0 };
}

async function membershipExpiryReminderJob(daysAhead = 3) {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + Number(daysAhead));

  const start = new Date(target);
  start.setHours(0, 0, 0, 0);

  const end = new Date(target);
  end.setHours(23, 59, 59, 999);

  const ms = await Membership.find({
    status: "active",
    endAt: { $gte: start, $lte: end },
    expiringNotifiedAt: null
  }).lean();

  for (const m of ms) {
    const [member, club] = await Promise.all([
      User.findById(m.userId).lean(),
      Club.findById(m.clubId).lean()
    ]);

    if (member?.email) {
      notify("MEMBERSHIP_EXPIRING", { member, club, membership: m }, { async: true });

      await Membership.updateOne(
        { _id: m._id, expiringNotifiedAt: null },
        { $set: { expiringNotifiedAt: new Date() } }
      );
    }
  }

  return { count: ms.length };
}

module.exports = {
  createMembership,
  cancelMembership,
  getUserMemberships,
  getMyActiveMembership,
  expireMembershipsJob,
  membershipExpiryReminderJob
};
