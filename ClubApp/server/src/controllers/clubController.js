const asyncHandler = require("../utils/asyncHandler");
const clubService = require("../services/clubService");

exports.create = asyncHandler(async (req, res) => {
  const club = await clubService.createClub(req.body);
  res.status(201).json({ ok: true, data: club });
});

exports.list = asyncHandler(async (req, res) => {
  const { type, isPublic, q } = req.query;

  const data = await clubService.listClubs({
    type: type || undefined,
    q: q || undefined,
    isPublic:
      isPublic === undefined ? undefined : String(isPublic) === "true"
  });

  res.json({ ok: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const data = await clubService.getClubById(req.params.id);
  res.json({ ok: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await clubService.updateClub(req.params.id, req.body);
  res.json({ ok: true, data });
});

exports.setVisibility = asyncHandler(async (req, res) => {
  const data = await clubService.setClubVisibility(req.params.id, req.body.isPublic);
  res.json({ ok: true, data });
});

exports.remove = asyncHandler(async (req, res) => {
  const data = await clubService.deleteClub(req.params.id);
  res.json({ ok: true, data });
});
