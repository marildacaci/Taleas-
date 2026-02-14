const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const AppError = require("../utils/AppError");
const membershipService = require("./membershipService");
const { notify } = require("./notificationService");
const User = require("../models/User");
const Club = require("../models/Club");

async function createPaymentIntentRecord({ userId, clubId, planId, stripePaymentIntentId }) {
  if (!userId || !clubId || !planId) {
    throw new AppError("userId, clubId, planId are required", 400, "VALIDATION_ERROR");
  }
  if (!stripePaymentIntentId) {
    throw new AppError("stripePaymentIntentId is required", 400, "VALIDATION_ERROR");
  }

  const plan = await Plan.findById(planId).lean();
  if (!plan) throw new AppError("Plan not found", 404, "NOT_FOUND");
  if (!plan.isActive) throw new AppError("Plan is not active", 400, "VALIDATION_ERROR");
  if (String(plan.clubId) !== String(clubId)) {
    throw new AppError("Plan does not belong to this club", 400, "VALIDATION_ERROR");
  }

  try {
    return await Payment.create({
      userId,
      clubId,
      planId,
      currency: plan.currency || "EUR",
      amount: plan.price,
      status: "pending",
      stripePaymentIntentId
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw new AppError("stripePaymentIntentId must be unique", 409, "CONFLICT", err.keyValue);
    }
    throw err;
  }
}

async function markPaidAndCreateMembership({ stripePaymentIntentId }) {
  if (!stripePaymentIntentId) {
    throw new AppError("stripePaymentIntentId is required", 400, "VALIDATION_ERROR");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ stripePaymentIntentId }).session(session);
    if (!payment) throw new AppError("Payment not found", 404, "NOT_FOUND");

    if (payment.status === "paid") {
      await session.commitTransaction();
      session.endSession();
      return { payment: payment.toObject(), membership: null, idempotent: true };
    }

    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save({ session });

    const membership = await membershipService.createMembership(
      {
        userId: payment.userId,
        clubId: payment.clubId,
        planId: payment.planId,
        startAt: payment.paidAt
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const [member, club, plan] = await Promise.all([
      User.findById(payment.userId).lean(),
      Club.findById(payment.clubId).lean(),
      Plan.findById(payment.planId).lean()
    ]);

    notify(
    "MEMBERSHIP_CREATED",
    {
        member,
        club,
        plan,
        membership,
        payment: {
            amount: payment.amount,
            currency: payment.currency,
            paidAt: payment.paidAt,
            stripePaymentIntentId: payment.stripePaymentIntentId
        }
    }, { async: true }
);

    return { payment: payment.toObject(), membership, idempotent: false };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function getUserPayments(userId, { status } = {}) {
  const filter = { userId };
  if (status) filter.status = status;
  return Payment.find(filter).sort({ createdAt: -1 }).lean();
}

async function markFailed({ stripePaymentIntentId }) {
  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId },
    { status: "failed" },
    { new: true }
  ).lean();

  if (!payment) throw new AppError("Payment not found", 404, "NOT_FOUND");
  return payment;
}

async function cancelPayment({ stripePaymentIntentId }) {
  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId },
    { status: "cancelled" },
    { new: true }
  ).lean();

  if (!payment) throw new AppError("Payment not found", 404, "NOT_FOUND");
  return payment;
}

module.exports = {
  createPaymentIntentRecord,
  markPaidAndCreateMembership,
  getUserPayments,
  markFailed,
  cancelPayment
};
