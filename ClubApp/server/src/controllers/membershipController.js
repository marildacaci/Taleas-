const asyncHandler = require("../utils/asyncHandler");
const Membership = require("../models/Membership");
const Club = require("../models/Club");
const Member = require("../models/Member");

exports.getAll = asyncHandler(async (req, res) => {
  const { clubId, memberId, status } = req.query;

  const filter = {};
  if (clubId) filter.clubId = clubId;
  if (memberId) filter.memberId = memberId;
  if (status) filter.status = status;

  const memberships = await Membership.find(filter).sort({ endDate: -1 }).lean();
  return res.json({ data: memberships });
});

exports.create = asyncHandler(async (req, res) => {
  const { clubId, memberId, planName, price, startDate, endDate, status } = req.body;

  if (!clubId) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "clubId") });
  if (!memberId) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "memberId") });
  if (!planName) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "planName") });
  if (price === undefined) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "price") });
  if (!startDate) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "startDate") });
  if (!endDate) return res.status(400).json({ error: req.t("VALIDATION_ERROR", "endDate") });

  const club = await Club.findById(clubId).lean();
  if (!club) return res.status(400).json({ error: req.t("NOT_FOUND", "Club") });

  const member = await Member.findById(memberId).lean();
  if (!member) return res.status(400).json({ error: req.t("NOT_FOUND", "Member") });

  if (String(member.clubId) !== String(clubId)) {
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "memberId") });
  }

  const membership = await Membership.create({
    clubId,
    memberId,
    planName: String(planName).trim(),
    price: Number(price),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    status: status || "active"
  });

  return res.status(201).json({
    message: req.t("MEMBERSHIP_CREATED"),
    data: membership
  });
});
