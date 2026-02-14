const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    currency: { type: String, default: "EUR"},

    amount:{ type: Number, required: true, min: 0},

    status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },

    stripePaymentIntentId: { type: String, required: true, unique: true },

    paidAt: { type: Date, default: null}
  }, { timestamps: true }
);

PaymentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
