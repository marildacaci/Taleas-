const express = require("express");
const router = express.Router();
const p = require("../controllers/planController");
const requireRole = require("../middlewares/requireRole");

router.get("/club/:clubId", p.listByClub);
router.get("/:id", p.getOne);

router.post("/", requireRole("admin"), p.create);
router.patch("/:id", requireRole("admin"), p.update);
router.patch("/:id/deactivate", requireRole("admin"), p.deactivate);
router.delete("/:id", requireRole("admin"), p.remove);

module.exports = router;
