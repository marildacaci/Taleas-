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

    type: {
      type: String,
      enum: [
        "fitness",
        "dance",
        "coding",
        "gym",
        "yoga",
        "football",
        "other"
      ],
      default: "other"
    },

    address: {
      street: { type: String, default: "" },
      buildingNumber: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "Albania" }
    },

    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },

    phone: { type: String, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },

    openingHours: {
      open: { type: String, default: "" },
      close: { type: String, default: "" }
    },

    plans: { type: [PlanSchema], default: [] },

    activityCatalog: { type: [ActivityCatalogSchema], default: [] },

    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Club", ClubSchema);
