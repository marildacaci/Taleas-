const { sendEmail } = require("./emailService");

const fmtDate = (x) => (x ? new Date(x).toLocaleDateString() : "-");

const TEMPLATES = {
  ACCOUNT_CREATED: (d) => ({
    to: d.member?.email,
    subject: `Welcome to ${process.env.APP_NAME || "Club App"}`,
    html: `<h2>Welcome</h2><p>Hi ${d.member?.firstName || "Member"}, your account was created.</p>`
  }),

  MEMBERSHIP_CREATED: (d) => ({
  to: d.member?.email,
  subject: `Membership active - ${d.club?.name || "Club"}`,
  html: `
    <h2>Membership created</h2>
    <p>Hi ${d.member?.firstName || "Member"},</p>

    <p>Club: <b>${d.club?.name || ""}</b></p>
    <p>Plan: <b>${d.plan?.name || ""}</b></p>

    <p>Period: <b>${fmtDate(d.membership?.startAt)}</b> - <b>${fmtDate(d.membership?.endAt)}</b></p>

    <hr/>

    <p><b>Total paid:</b> ${Number(d.payment?.amount ?? d.plan?.price ?? 0).toFixed(2)} ${d.payment?.currency || d.plan?.currency || "EUR"}</p>
    ${d.payment?.paidAt ? `<p><b>Paid at:</b> ${fmtDate(d.payment.paidAt)}</p>` : ""}
  `
  }),

  MEMBERSHIP_EXPIRING: (d) => ({
    to: d.member?.email,
    subject: `Membership expiring - ${d.club?.name || "Club"}`,
    html: `
      <h2>Membership expiring</h2>
      <p>Hi ${d.member?.firstName || "Member"},</p>
      <p>Your membership at <b>${d.club?.name || ""}</b> expires on <b>${fmtDate(d.membership?.endAt)}</b>.</p>
    `
  }),

  CLUB_DELETED: (d) => ({
    to: process.env.FROM_EMAIL || process.env.SMTP_USER,
    bcc: (d.members || []).map((m) => m?.email).filter(Boolean),
    subject: `Club deleted - ${d.clubName || ""}`,
    html: `<h2>Club deleted</h2><p>The club <b>${d.clubName || ""}</b> has been removed.</p>`
  })
};

async function notify(type, data, { async = true } = {}) {
  const builder = TEMPLATES[type];
  if (!builder) return;

  const msg = builder(data);
  if (!msg?.to && !msg?.cc && !msg?.bcc) return;

  const payload = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    ...msg
  };

  if (async) {
    setImmediate(() =>
      sendEmail(payload).catch((e) =>
        console.error("[EMAIL] failed:", type, payload?.to || "(bcc)", e?.message || e)
      )
    );
    return;
  }

  await sendEmail(payload);
}

module.exports = { notify, TEMPLATES };
