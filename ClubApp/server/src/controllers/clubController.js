const Club = require("../models/Club");
const Enrollment = require("../models/Enrollment");
const Membership = require("../models/Membership");
const Member = require("../models/Member");
const asyncHandler = require("../utils/asyncHandler");
const {
  notifyClubDeleted,
  notifyMembershipCreated
} = require("../services/notificationService");


const DEFAULT_PLANS = [
  { name: "Monthly", durationDays: 30, price: 30 },
  { name: "3 Months", durationDays: 90, price: 80 }
];

const DEFAULT_CATALOG_BY_TYPE = {
  fitness: [
    { name: "Yoga", activityType: "class" },
    { name: "Zumba", activityType: "class" },
    { name: "Cardio", activityType: "training" }
  ],
  dance: [
    { name: "Hip Hop", activityType: "class" },
    { name: "Ballet", activityType: "class" },
    { name: "Salsa", activityType: "class" }
  ],
  coding: [
    { name: "Frontend", activityType: "class" },
    { name: "Backend", activityType: "class" },
    { name: "Algorithms", activityType: "class" }
  ]
};

exports.getOptions = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id).lean();
  if (!club) return res.status(404).json({ error: req.t("NOT_FOUND", "Club") });

  return res.json({
    data: {
      clubId: club._id,
      plans: club.plans || [],
      activityCatalog: club.activityCatalog || []
    }
  });
});


exports.join = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id).lean();
  if (!club) return res.status(404).json({ error: req.t("NOT_FOUND", "Club") });

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    age,
    planName,
    selectedActivities
  } = req.body || {};

  if (!firstName)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "firstName") });
  if (!lastName)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "lastName") });
  if (!email)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "email") });
  if (!planName)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "planName") });

  const plan = (club.plans || []).find((p) => p.name === planName);
  if (!plan) return res.status(400).json({ error: "Invalid membership plan" });

  const catalogNames = new Set((club.activityCatalog || []).map((a) => a.name));
  const activities = Array.isArray(selectedActivities) ? selectedActivities : [];

  for (const a of activities) {
    if (!catalogNames.has(a)) {
      return res.status(400).json({ error: `Invalid activity: ${a}` });
    }
  }

  const member = await Member.create({
    clubId: club._id,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).toLowerCase().trim(),
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
    age: age === undefined || age === null || age === "" ? null : Number(age)
  });

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(plan.durationDays));

  const membership = await Membership.create({
    clubId: club._id,
    memberId: member._id,
    planName: plan.name,
    price: plan.price,
    startDate,
    endDate,
    status: "active"
  });

  if (activities.length) {
    const docs = activities.map((name) => ({
      clubId: club._id,
      memberId: member._id,
      activityName: name
    }));
    await Enrollment.insertMany(docs, { ordered: false }).catch(() => {});
  }

  setImmediate(() => {
    notifyMembershipCreated({
      lang: req.lang,
      member,
      clubName: club.name,
      membership
    }).catch(console.error);
  });

  return res.status(201).json({
    message: req.t("MEMBERSHIP_CREATED"),
    data: { member, membership, selectedActivities: activities }
  });
});


exports.create = asyncHandler(async (req, res) => {
  const { name, type } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "name") });
  }

  const club = await Club.create({
    ...req.body,
    name: name.trim(),
    plans: Array.isArray(req.body?.plans) && req.body.plans.length
      ? req.body.plans
      : DEFAULT_PLANS,
    activityCatalog: Array.isArray(req.body?.activityCatalog) && req.body.activityCatalog.length
      ? req.body.activityCatalog
      : (DEFAULT_CATALOG_BY_TYPE[type] || [])
  });

  return res.status(201).json({
    message: req.t("CLUB_CREATED", club.name),
    data: club
  });
});


exports.delete = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id).lean();
  if (!club) return res.status(404).json({ error: req.t("NOT_FOUND", "Club") });

  const memberships = await Membership.find({
    clubId: club._id,
    status: "active"
  }).lean();

  const memberIds = [...new Set(memberships.map((m) => String(m.memberId)))];
  const members = await Member.find({ _id: { $in: memberIds } }).lean();

  await Club.findByIdAndDelete(club._id);

  setImmediate(() => {
    notifyClubDeleted({
      members,
      clubName: club.name
    }).catch(console.error);
  });

  return res.json({ message: req.t("CLUB_DELETED") });
});
