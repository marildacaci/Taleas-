const mongoose = require("mongoose");

const ClubTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // p.sh "fitness"
    name: { type: String, required: true, trim: true }, // p.sh "Fitness"
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClubType", ClubTypeSchema);
