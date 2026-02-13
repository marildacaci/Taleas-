import { clearSession, readSession } from "../storage/session";
import { t } from "../i18n";

function daysLeft(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ProfileDrawer({ open, onClose, lang, onLogout }) {
  if (!open) return null;

  const session = readSession();
  const member = session?.member;
  const membership = session?.membership;

  const left = daysLeft(membership?.endDate);

  return (
    <div className="drawerBackdrop" onMouseDown={onClose}>
      <div className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawerHeader">
          <div className="drawerTitle">{t(lang, "viewProfile")}</div>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>

        {!session ? (
          <div className="muted">No profile yet. Join a club first.</div>
        ) : (
          <>
            <div className="box">
              <div className="boxTitle">Member</div>
              <div><b>{member?.firstName} {member?.lastName}</b></div>
              <div className="muted">{member?.email}</div>
              <div className="muted">{member?.phoneNumber || ""}</div>
            </div>

            <div className="box">
              <div className="boxTitle">{t(lang, "membership")}</div>
              <div><b>{session?.club?.name}</b></div>
              <div className="muted">{membership?.planName} — {membership?.price}</div>
              <div className="muted">
                {t(lang, "deadline")}: <b>{membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : "-"}</b>
              </div>
              {typeof left === "number" ? (
                <div className={`pill ${left <= 3 ? "pillWarn" : "pillOk"}`}>
                  {t(lang, "daysLeft")}: {left}
                </div>
              ) : null}
            </div>

            <div className="box">
              <div className="boxTitle">{t(lang, "activities")}</div>
              <div className="chips">
                {(session?.selectedActivities || []).map((a) => (
                  <span key={a} className="chip chipOn">{a}</span>
                ))}
                {(session?.selectedActivities || []).length === 0 ? (
                  <div className="muted">No activities selected.</div>
                ) : null}
              </div>
            </div>

            <button
              className="btnDanger"
              onClick={() => {
                clearSession();
                onLogout?.();
                onClose();
              }}
            >
              {t(lang, "logout")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
