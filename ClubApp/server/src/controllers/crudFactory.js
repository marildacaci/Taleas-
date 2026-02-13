const asyncHandler = require("../utils/asyncHandler");


exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const docs = await Model.find().lean();
    res.json({ data: docs });
  });

exports.getOne = (Model, name) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: req.t("NOT_FOUND", name) });
    res.json({ data: doc });
  });

exports.updateOne = (Model, entityName, notFoundName) =>
  asyncHandler(async (req, res) => {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated)
      return res
        .status(404)
        .json({ error: req.t("NOT_FOUND", notFoundName) });

    res.json({
      message: req.t(`${entityName.toUpperCase()}_UPDATED`),
      data: updated
    });
  });

exports.deleteOne = (Model, entityName, notFoundName) =>
  asyncHandler(async (req, res) => {
    const deleted = await Model.findByIdAndDelete(req.params.id).lean();

    if (!deleted)
      return res
        .status(404)
        .json({ error: req.t("NOT_FOUND", notFoundName) });

    res.json({
      message: req.t(`${entityName.toUpperCase()}_DELETED`),
      data: deleted
    });
  });
