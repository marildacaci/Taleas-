const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");

exports.createIntentRecord = asyncHandler(async (req, res) => {
  const data = await paymentService.createPaymentIntentRecord(req.body);
  res.status(201).json({ ok: true, data });
});

exports.confirmPaid = asyncHandler(async (req, res) => {
  const data = await paymentService.markPaidAndCreateMembership(req.body);
  res.json({ ok: true, data });
});

exports.listByUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const data = await paymentService.getUserPayments(userId, req.query);
  res.json({ ok: true, data });
});

exports.markFailed = asyncHandler(async (req, res) => {
  const data = await paymentService.markFailed(req.body);
  res.json({ ok: true, data });
});

exports.cancel = asyncHandler(async (req, res) => {
  const data = await paymentService.cancelPayment(req.body);
  res.json({ ok: true, data });
});
