const express = require("express");
const router = express.Router();
const CATALOG = require("../catalog/clubCatalog");

router.get("/clubs", (req, res) => {
  const { type } = req.query;

  if (!type || !CATALOG[type]) {
    return res.status(400).json({
      ok: false,
      error: "Invalid club type"
    });
  }

  return res.json({
    ok: true,
    data: CATALOG[type]
  });
});

module.exports = router;
