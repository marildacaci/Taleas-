const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    activityType: {
      type: String,
      enum: ["class", "training", "match", "event", "other"],
      default: "class"
    },

    startsAt: {
      type: Date,
      required: true
    },

    endsAt: {
      type: Date,
      required: true
    },

    capacity: {
      type: Number,
      default: 0
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
