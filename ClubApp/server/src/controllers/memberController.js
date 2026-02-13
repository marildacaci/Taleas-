const asyncHandler = require("../utils/asyncHandler");
const Member = require("../models/Member");
const Club = require("../models/Club");

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.create = asyncHandler(async (req, res) => {
  const { clubId, firstName, lastName, email, phoneNumber, age } = req.body;

  if (!clubId)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "clubId") });

  if (!firstName)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "firstName") });

  if (!lastName)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "lastName") });

  if (!email)
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "email") });

  // age is optional for MVP

  if (!validEmail(email))
    return res.status(400).json({ error: req.t("VALIDATION_ERROR", "email") });

  const club = await Club.findById(clubId).lean();
  if (!club) return res.status(400).json({ error: req.t("NOT_FOUND", "Club") });

  const member = await Member.create({
    clubId,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).toLowerCase().trim(),
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
    age: age === undefined || age === null || age === "" ? null : Number(age)
  });

  return res.status(201).json({
    message: req.t("MEMBER_CREATED"),
    data: member
  });
});
