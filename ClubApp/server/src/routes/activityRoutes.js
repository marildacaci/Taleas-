const router = require("express").Router();
const Activity = require("../models/Activity");
const crud = require("../controllers/crudFactory");
const activity = require("../controllers/activityController");

router.post("/", activity.create);
router.get("/", activity.getAll);

router.get("/:id", crud.getOne(Activity, "Activity"));
router.put("/:id", crud.updateOne(Activity, "activity", "Activity"));
router.delete("/:id", crud.deleteOne(Activity, "activity", "Activity"));

module.exports = router;
