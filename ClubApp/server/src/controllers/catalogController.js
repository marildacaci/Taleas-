const CATALOG = require("../catalog/catalog");

exports.getClubCatalog = (req, res) => {
  const type = req.query.type || "fitness";

  const data = CATALOG[type];
  if (!data) {
    return res.status(400).json({ ok: false, error: "Invalid type" });
  }

  res.json({ ok: true, data });
};
