import { useEffect, useMemo, useState } from "react";
import { getClubOptions, joinClub } from "../api/clubsApi";
import { saveSession } from "../storage/session";
import { t } from "../i18n";

export default function JoinModal({ open, onClose, club, lang, onJoined }) {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState("");

  const [plans, setPlans] = useState([]);
  const [catalog, setCatalog] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    age: "",
    planName: "",
    selectedActivities: []
  });

  useEffect(() => {
    if (!open || !club?._id) return;

    setError("");
    setOptionsLoading(true);
    getClubOptions(club._id, lang)
      .then((json) => {
        const p = json?.data?.plans || [];
        const c = json?.data?.activityCatalog || [];
        setPlans(p);
        setCatalog(c);

        setForm((prev) => ({
          ...prev,
          planName: p[0]?.name || "",
          selectedActivities: []
        }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setOptionsLoading(false));
  }, [open, club?._id, lang]);

  const activityNames = useMemo(() => catalog.map((a) => a.name), [catalog]);

  if (!open) return null;

  function toggleActivity(name) {
    setForm((prev) => {
      const exists = prev.selectedActivities.includes(name);
      return {
        ...prev,
        selectedActivities: exists
          ? prev.selectedActivities.filter((x) => x !== name)
          : [...prev.selectedActivities, name],
      };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Please fill first name, last name, and email.");
      return;
    }
    if (!form.planName) {
      setError("No membership plan found for this club.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        age: form.age ? Number(form.age) : undefined,
        planName: form.planName,
        selectedActivities: form.selectedActivities
      };

      const json = await joinClub(club._id, payload, lang);

      // Save as "logged in" session (simple MVP)
      saveSession({
        club,
        member: json?.data?.member,
        membership: json?.data?.membership,
        selectedActivities: json?.data?.selectedActivities || []
      });

      onJoined?.(json);
      onClose();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{t(lang, "registerToJoin")}</div>
            <div className="modalSub">{t(lang, "club")}: <b>{club?.name}</b></div>
          </div>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>

        {optionsLoading ? <p>{t(lang, "loading")}</p> : null}
        {error ? <div className="alertErr">{error}</div> : null}

        <form className="formGrid" onSubmit={submit}>
          <div className="row2">
            <label>
              {t(lang, "firstName")}
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label>
              {t(lang, "lastName")}
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
          </div>

          <label>
            {t(lang, "email")}
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>

          <div className="row2">
            <label>
              {t(lang, "phone")}
              <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </label>
            <label>
              {t(lang, "age")}
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </label>
          </div>

          <label>
            {t(lang, "membershipPlan")}
            <select
                value={form.planName}
                onChange={(e) => setForm({ ...form, planName: e.target.value })}
                disabled={plans.length === 0}
            >
            {plans.length === 0 ? (
                <option value="">No plans configured</option>
            ) : (
                plans.map((p) => (
                    <option key={p.name} value={p.name}>
                        {p.name} — {p.durationDays}d — {p.price}
                    </option>
                ))
            )}
            </select>
            </label>


          <div>
            <div className="label">{t(lang, "activities")}</div>
            <div className="chips">
              {activityNames.length === 0 ? (
                <div className="muted">No activities configured for this club.</div>
              ) : (
                activityNames.map((name) => {
                  const active = form.selectedActivities.includes(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      className={`chip ${active ? "chipOn" : ""}`}
                      onClick={() => toggleActivity(name)}
                    >
                      {name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btnGhost" onClick={onClose}>
              {t(lang, "cancel")}
            </button>
            <button className="btnPrimary" disabled={loading || plans.length === 0}>
                {loading ? t(lang, "loading") : t(lang, "submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
