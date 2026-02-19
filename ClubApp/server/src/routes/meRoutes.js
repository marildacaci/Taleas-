const express = require("express");
const router = express.Router();

const requireCognitoAuth = require("../middlewares/requireCognitoAuth");

router.get("/", requireCognitoAuth, (req, res) => {
  res.json({ ok: true, data: { auth: req.auth, user: req.user } });
});

module.exports = router;
