const mongoose = require("mongoose");

const MembershipPlanSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, 
    name: { type: String, required: true, trim: true }, 
    durationDays: { type: Number, required: true, min: 1 }, 
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EUR" },

    clubTypeKey: { type: String, default: null, trim: true },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", MembershipPlanSchema);
