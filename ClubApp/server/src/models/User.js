const mongoose = require("mongoose");

function emptyToNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

const UserSchema = new mongoose.Schema(
  {
    cognitoSub: { type: String, unique: true, sparse: true },

    username: { type: String, trim: true, default: null, set: emptyToNull },
    email: { type: String, lowercase: true, trim: true, default: null, set: emptyToNull },

    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },

    passwordHash: { type: String, select: false },

    phoneNumber: { type: String, trim: true, default: null, set: emptyToNull },

    age: { type: Number, default: null },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

UserSchema.index(
  { email: 1 },
  { name: "user_email_unique", unique: true, partialFilterExpression: { email: { $type: "string", $ne: "" } } }
);

UserSchema.index(
  { username: 1 },
  { name: "user_username_unique", unique: true, partialFilterExpression: { username: { $type: "string", $ne: "" } } }
);

UserSchema.index(
  { phoneNumber: 1 },
  { name: "user_phone_unique", unique: true, partialFilterExpression: { phoneNumber: { $type: "string", $ne: "" } } }
);

module.exports = mongoose.model("User", UserSchema);
