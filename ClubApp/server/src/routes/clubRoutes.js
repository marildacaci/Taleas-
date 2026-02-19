const express = require("express");
const router = express.Router();

const clubs = require("../controllers/clubController");
const requireAuth = require("../middlewares/requireCognitoAuth");
const requireRole = require("../middlewares/requireRole");

router.get("/public", clubs.listPublic);

router.get("/", requireAuth, requireRole("admin"), clubs.listAllAdmin);
router.post("/", requireAuth, requireRole("admin"), clubs.create);
router.patch("/:id/visibility", requireAuth, requireRole("admin"), clubs.setVisibility);
router.patch("/:id", requireAuth, requireRole("admin"), clubs.update);
router.delete("/:id", requireAuth, requireRole("admin"), clubs.remove);

module.exports = router;