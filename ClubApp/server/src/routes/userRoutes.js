const express = require("express");
const router = express.Router();
const u = require("../controllers/userController");
const requireAuth = require("../middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");

router.post("/", requireRole("admin"), u.create);
router.get("/", requireRole("admin"), u.list);
router.get("/:id", requireRole("admin"), u.getOne);
router.patch("/:id", requireRole("admin"), u.update);
router.delete("/:id", requireRole("admin"), u.remove);

router.patch("/:userId/profile", requireAuth, u.updateMyProfile);

module.exports = router;
