const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Monthly"
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ActivityCatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Yoga"
    activityType: {
      type: String,
      enum: ["class", "training", "match", "event", "other"],
      default: "class"
    }
  },
  { _id: false }
);

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },

    type: { type: String, enum: [ "fitness", "dance", "coding" ], required: true },

    description: { type: String, default: "" },

    address: {type: String, default: ""},

    isPublic: {type: Boolean, default : true }
  }, { timestamps: true }
);

module.exports = mongoose.model("Club", ClubSchema);
