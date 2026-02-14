const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: { type: String, enum: ["active", "expired", "canceled"], default: "active" }
  },
  { timestamps: true }
);

MembershipSchema.index({ userId: 1, clubId: 1 },{ unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("Membership", MembershipSchema);
