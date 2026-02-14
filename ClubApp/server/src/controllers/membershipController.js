const asyncHandler = require("../utils/asyncHandler");
const membershipService = require("../services/membershipService");

exports.create = asyncHandler(async (req, res) => {
  const data = await membershipService.createMembership(req.body);
  res.status(201).json({ ok: true, data });
});

exports.cancel = asyncHandler(async (req, res) => {
  const data = await membershipService.cancelMembership(req.body);
  res.json({ ok: true, data });
});

exports.listByUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const data = await membershipService.getUserMemberships(userId);
  res.json({ ok: true, data });
});

exports.getActive = asyncHandler(async (req, res) => {
  const { userId, clubId } = req.query;
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
