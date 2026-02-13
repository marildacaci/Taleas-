const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true
    },
    age: {
      type: Number,
      default: null,
      min: 0
    }
  },
  { timestamps: true }
);

MemberSchema.index({ clubId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Member", MemberSchema);
