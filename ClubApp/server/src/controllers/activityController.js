const asyncHandler = require("../utils/asyncHandler");
const Activity = require("../models/Activity");
const Club = require("../models/Club");

exports.getAll = asyncHandler(async (req, res) => {
  const { clubId } = req.query;

  const filter = {};
  if (clubId) filter.clubId = clubId;

  const activities = await Activity.find(filter).sort({ startsAt: 1 }).lean();
  return res.json({ data: activities });
});

exports.create = asyncHandler(async (req, res) => {
  const { clubId, title, startsAt, endsAt, description, activityType, capacity } =
    req.body || {};

  if (!clubId)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "clubId") });
  if (!title)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "title") });
  if (!startsAt)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "startsAt") });
  if (!endsAt)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "endsAt") });

  const club = await Club.findById(clubId).lean();
  if (!club) return res.status(400).json({ error: req.t("NOT_FOUND", "Club") });

  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()))
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "startsAt") });
  if (Number.isNaN(end.getTime()))
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "endsAt") });
  if (end <= start)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "endsAt") });

  const activity = await Activity.create({
    clubId,
    title: String(title).trim(),
    description: description ? String(description).trim() : "",
    activityType: activityType || "class",
    capacity:
      capacity === undefined || capacity === null || capacity === ""
        ? 0
        : Number(capacity),
    startsAt: start,
    endsAt: end
  });

  return res.status(201).json({
    message: req.t("ACTIVITY_CREATED", activity.title),
    data: activity
  });
});
