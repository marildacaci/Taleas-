const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    clubId: { type: mongoose.Schema.Types.ObjectId,  ref: "Club", required: true },

    name: { type: String, required: true, trim: true }, 

    durationDays: { type: Number, required: true }, 

    price: { type: Number, required: true, min: 0 },

    currency: { type: String, default: "EUR" },

    includedActivities: [{ type: String, trim: true}], 
    
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
PlanSchema.index({ clubId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Plan", PlanSchema);
