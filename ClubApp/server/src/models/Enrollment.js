const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema(
  {
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    activityName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

EnrollmentSchema.index(
  { clubId: 1, memberId: 1, activityName: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
