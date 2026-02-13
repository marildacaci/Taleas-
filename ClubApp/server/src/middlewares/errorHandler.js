module.exports = (err, req, res, next) => {
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(400).json({
      error: req.t("VALIDATION_ERROR", field)
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
        error: req.t("VALIDATION_ERROR"),
        details: err.message,
        fields: Object.keys(err.errors || {})
    });
}


  console.error(err);
  return res.status(500).json({
    error: req.t("INTERNAL_ERROR")
  });
};
