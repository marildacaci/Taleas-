const asyncHandler = require("../utils/asyncHandler");
const membershipService = require("../services/membershipService");

function getUserId(req) {
  return String(req.user?._id || req.user?.id || "");
}

exports.create = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });

  const { clubId, planId, selectedActivities } = req.body;
const data = await membershipService.createMembership({ userId, clubId, planId, selectedActivities });
res.status(201).json({ ok: true, data });
});

exports.cancel = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Missing user" });

  const { membershipId } = req.body || {};
  const data = await membershipService.cancelMembership({ userId, membershipId });
  res.json({ ok: true, data });
});

exports.listMy = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const data = await membershipService.getUserMemberships(userId);
  res.json({ ok: true, data });
});

exports.getActive = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { clubId } = req.query;
  const data = await membershipService.getMyActiveMembership({ userId, clubId });
  res.json({ ok: true, data });
});

exports.runExpireJob = asyncHandler(async (req, res) => {
  const data = await membershipService.expireMembershipsJob(new Date());
  res.json({ ok: true, data });
});

exports.runReminderJob = asyncHandler(async (req, res) => {
  const daysAhead = Number(req.query.daysAhead || 3);
  const data = await membershipService.membershipExpiryReminderJob(daysAhead);
  res.json({ ok: true, data });
});

exports.listByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await membershipService.getUserMemberships(userId);
  res.json({ ok: true, data });
});
