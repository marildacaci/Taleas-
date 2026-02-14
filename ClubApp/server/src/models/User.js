const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true,trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true, sparse: true },
    age: { type: Number, default: null, min: 18 },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  }, { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", UserSchema);
