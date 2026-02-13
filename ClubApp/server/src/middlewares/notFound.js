module.exports = (req, res) => {
  res.status(404).json({ error: req.t("NOT_FOUND", "Route") });
};
