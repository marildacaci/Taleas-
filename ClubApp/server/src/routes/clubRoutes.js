const express = require("express");
const router = express.Router();
const c = require("../controllers/clubController");
const requireRole = require("../middlewares/requireRole");

router.get("/", c.list);
router.get("/:id", c.getOne);

router.post("/", requireRole("admin"), c.create);
router.patch("/:id", requireRole("admin"), c.update);
router.patch("/:id/visibility", requireRole("admin"), c.setVisibility);
router.delete("/:id", requireRole("admin"), c.remove);

module.exports = router;
