const asyncHandler = require("../utils/asyncHandler");
const planService = require("../services/planService");

exports.create = asyncHandler(async (req, res) => {
  const data = await planService.createPlan(req.body);
  res.status(201).json({ ok: true, data });
});

exports.listByClub = asyncHandler(async (req, res) => {
  const clubId = req.params.clubId;
  const data = await planService.listPlansByClub(clubId, req.query);
  res.json({ ok: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const data = await planService.getPlanById(req.params.id);
  res.json({ ok: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await planService.updatePlan(req.params.id, req.body);
  res.json({ ok: true, data });
});

exports.deactivate = asyncHandler(async (req, res) => {
  const data = await planService.deactivatePlan(req.params.id);
  res.json({ ok: true, data });
});

exports.remove = asyncHandler(async (req, res) => {
  const data = await planService.deletePlan(req.params.id);
  res.json({ ok: true, data });
});
