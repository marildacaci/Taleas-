import { useEffect, useMemo, useState } from "react";
import { getClubs } from "../api/clubsApi";
import { createActivity, getActivitiesByClub } from "../api/activitiesApi";
import ActivityCard from "../components/ActivityCard";
import { t } from "../i18n";

export default function ActivitiesPage({ lang }) {
  const [clubs, setClubs] = useState([]);
  const [clubId, setClubId] = useState("");
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    activityType: "class",
    capacity: 0,
    startsAt: "",
    endsAt: "",
  });

  const selectedClub = useMemo(
    () => clubs.find((c) => c._id === clubId) || null,
    [clubs, clubId]
  );

  async function loadClubs() {
    setErr("");
    try {
      const json = await getClubs(lang);
      const list = json.data || [];
      setClubs(list);
      if (!clubId && list[0]?._id) setClubId(list[0]._id);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadActivities(id) {
    if (!id) return;
    setErr("");
    setLoading(true);
    try {
      const json = await getActivitiesByClub(id, lang);
      setActivities(json.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClubs();
  }, [lang]);

  useEffect(() => {
    loadActivities(clubId);
  }, [clubId, lang]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!clubId) {
      setErr("Choose a club");
      return;
    }

    if (!form.title.trim() || !form.startsAt || !form.endsAt) {
      setErr("Title, startsAt, endsAt are required");
      return;
    }

    const payload = {
      clubId,
      title: form.title.trim(),
      description: form.description.trim(),
      activityType: form.activityType,
      capacity: Number(form.capacity) || 0,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    };

    try {
      await createActivity(payload, lang);
      setMsg("Activity created");
      setForm({
        title: "",
        description: "",
        activityType: "class",
        capacity: 0,
        startsAt: "",
        endsAt: "",
      });
      await loadActivities(clubId);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="content">
      <div className="pageHeader">
        <div>
          <h1>Activities</h1>
          <p className="muted">
            Schedule per club (choose a club, then see activities).
          </p>
        </div>
        <button className="btnGhost" onClick={() => loadActivities(clubId)}>
          Refresh
        </button>
      </div>

      {err ? <div className="alertErr">{err}</div> : null}
      {msg ? <div className="alertOk">{msg}</div> : null}

      <div className="clubCard" style={{ marginBottom: 14 }}>
        <div className="clubName" style={{ marginBottom: 10 }}>
          Select club
        </div>

        <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
          {clubs.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>

        {selectedClub ? (
          <div className="clubMeta" style={{ marginTop: 10 }}>
            <span className="pill">{t(lang, "club")}: {selectedClub.name}</span>
            <span className="pill">{t(lang, "type")}: {selectedClub.type}</span>
          </div>
        ) : null}
      </div>

      <div className="clubCard" style={{ marginBottom: 14 }}>
        <div className="clubName" style={{ marginBottom: 10 }}>
          Add activity (admin)
        </div>

        <form className="formGrid" onSubmit={submit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Yoga"
            />
          </label>

          <label>
            Description
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
          </label>

          <div className="row2">
            <label>
              Type
              <select
                value={form.activityType}
                onChange={(e) => setForm({ ...form, activityType: e.target.value })}
              >
                <option value="class">class</option>
                <option value="training">training</option>
                <option value="event">event</option>
                <option value="other">other</option>
              </select>
            </label>

            <label>
              Capacity
              <input
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                type="number"
                min="0"
              />
            </label>
          </div>

          <div className="row2">
            <label>
              Starts At
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </label>

            <label>
              Ends At
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </label>
          </div>

          <div className="actions">
            <button className="btnPrimary" type="submit">
              Create
            </button>
          </div>
        </form>
      </div>

      {loading ? <p>{t(lang, "loading")}</p> : null}

      <div className="grid">
        {activities.map((a) => (
          <ActivityCard key={a._id} activity={a} lang={lang} />
        ))}
        {!loading && activities.length === 0 ? (
          <div className="empty">No activities for this club yet.</div>
        ) : null}
      </div>
    </div>
  );
}
