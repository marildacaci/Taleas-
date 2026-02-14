module.exports = (err, req, res, next) => {
  if (err?.code === 11000) {
    return res.status(409).json({
      ok: false,
      error: {
        code: "CONFLICT",
        message: "Duplicate field value",
        details: err.keyValue || null
      }
    });
  }

  const status = err.statusCode || err.status || 500;
  const code = err.code || err.errorCode || "INTERNAL_ERROR";

  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", err);
  }

  return res.status(status).json({
    ok: false,
    error: {
      code,
      message: err.message || "Something went wrong",
      details: err.details || err.meta || null
    }
  });
};
