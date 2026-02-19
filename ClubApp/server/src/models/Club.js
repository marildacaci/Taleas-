const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["fitness", "dance", "coding"], required: true },

    description: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },

    coverImage: { type: String, default: "", trim: true },
    isPublic: { type: Boolean, default: false },

    plans: { type: [PlanSchema], default: [] },

    activities: { type: [String], default: [] },

    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null }
  },
  { timestamps: true }
);

ClubSchema.index({ isPublic: 1, createdAt: -1 });
ClubSchema.index({ type: 1, isPublic: 1 });

module.exports = mongoose.model("Club", ClubSchema);
