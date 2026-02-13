const nodemailer = require("nodemailer");
const { membershipCreatedTemplate } = require("../templates/EmailTemplates");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log("EMAIL_USER exists?", Boolean(process.env.EMAIL_USER));
console.log("EMAIL_PASS exists?", Boolean(process.env.EMAIL_PASS));

exports.notifyClubDeleted = async ({ members, clubName }) => {
  if (!members?.length) return;

  const emails = members.filter((m) => m.email).map((m) => m.email);
  if (!emails.length) return;

  await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: emails,
    subject: `Club ${clubName} was deleted`,
    html: `
      <h2>Club Deleted</h2>
      <p>The club <strong>${clubName}</strong> has been removed.</p>
    `
  });
};

exports.notifyMembershipCreated = async ({ lang = "en", member, clubName, membership }) => {
  if (!member?.email) return;

  const memberName =
    `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Member";

  const { subject, html } = membershipCreatedTemplate(lang, {
    memberName,
    clubName,
    planName: membership?.planName || "",
    price: membership?.price ?? "",
    startDate: membership?.startDate,
    endDate: membership?.endDate
  });

  await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: member.email,
    subject,
    html
  });
};

exports.notifyMembershipExpiryReminder = async ({ member, clubName, membership }) => {
  if (!member?.email) return;

  const end = membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : "";
  await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: member.email,
    subject: `Reminder: membership expires soon - ${clubName}`,
    html: `
      <h2>Membership expiring soon</h2>
      <p>Hi ${member.firstName || member.name || ""},</p>
      <p>Your membership for <b>${clubName}</b> will expire on <b>${end}</b>.</p>
    `
  });
};

exports.notifyMembershipExpired = async ({ member, clubName, membership }) => {
  if (!member?.email) return;

  const end = membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : "";
  await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: member.email,
    subject: `Membership expired - ${clubName}`,
    html: `
      <h2>Membership expired</h2>
      <p>Hi ${member.firstName || member.name || ""},</p>
      <p>Your membership for <b>${clubName}</b> expired on <b>${end}</b>.</p>
    `
  });
};

exports.notifyRegistrationCancelled = async ({ member, clubName, activity }) => {
  if (!member?.email) return;

  await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: member.email,
    subject: `Registration cancelled - ${clubName}`,
    html: `
      <h2>Registration cancelled</h2>
      <p>Hi ${member.firstName || member.name || ""},</p>
      <p>Your registration for <b>${activity?.name || "the activity"}</b> at <b>${clubName}</b> has been cancelled.</p>
    `
  });
};

async function testEmail() {
  const info = await transporter.sendMail({
    from: `"Club App" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "TEST EMAIL - ClubApp",
    html: "<h2>Email works </h2><p>This is a test.</p>"
  });

  console.log("Email sent:", info.messageId);
}

testEmail().catch(console.error);
