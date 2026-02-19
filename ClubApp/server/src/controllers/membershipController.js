const asyncHandler = require("../utils/asyncHandler");
const membershipService = require("../services/membershipService");
const User = require("../models/User");

async function requireDbUser(req) {
  const sub = req.auth?.sub; // <- nga requireCognitoAuth
  if (!sub) return null;

  const user = await User.findOne({ cognitoSub: String(sub) }).lean();
  return user || null;
}

exports.create = asyncHandler(async (req, res) => {
  const dbUser = await requireDbUser(req);
  if (!dbUser?._id) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });
  }

  const { clubId, planId, selectedActivities } = req.body || {};
  const data = await membershipService.createMembership({
    userId: String(dbUser._id),
    clubId,
    planId,
    selectedActivities
  });

  res.status(201).json({ ok: true, data });
});

exports.getActive = asyncHandler(async (req, res) => {
  const dbUser = await requireDbUser(req);
  if (!dbUser?._id) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });
  }

  const { clubId } = req.query;
  const data = await membershipService.getMyActiveMembership({
    userId: String(dbUser._id),
    clubId
  });

  res.json({ ok: true, data });
});

exports.listMy = asyncHandler(async (req, res) => {
  const dbUser = await requireDbUser(req);
  if (!dbUser?._id) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });
  }

  const data = await membershipService.getUserMemberships(String(dbUser._id));
  res.json({ ok: true, data });
});

exports.cancel = asyncHandler(async (req, res) => {
  const dbUser = await requireDbUser(req);
  if (!dbUser?._id) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });
  }

  const { membershipId } = req.body || {};
  const data = await membershipService.cancelMembership({
    userId: String(dbUser._id),
    membershipId
  });

  res.json({ ok: true, data });
});
exports.listByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const data = await membershipService.getUserMemberships(String(userId));
  res.json({ ok: true, data });
});

exports.runExpireJob = asyncHandler(async (req, res) => {
  // Admin job: expire memberships (implementation in service)
  const data = await membershipService.runExpireJob();
  res.json({ ok: true, data });
});

exports.runReminderJob = asyncHandler(async (req, res) => {
  // Admin job: send reminders (implementation in service)
  const data = await membershipService.runReminderJob();
  res.json({ ok: true, data });
});
