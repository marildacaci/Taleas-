import React, { useEffect, useMemo, useState } from "react";
import { getClubCatalog } from "../../api/catalog";
import { joinClub } from "../../api/memberships";
import "../../style/clubDetailsModal.css";

function toErrMsg(e) {
  return (
    e?.payload?.message ||
    e?.payload?.error?.message ||
    e?.message ||
    "Something went wrong."
  );
}

export default function ClubDetailsModal({ open, club, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [catalog, setCatalog] = useState(null);

  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [joining, setJoining] = useState(false);
  const [joinedUntil, setJoinedUntil] = useState(null); // ISO string nga backend

  const type = useMemo(() => club?.type || "fitness", [club?.type]);

  const plans = useMemo(() => (Array.isArray(catalog?.plans) ? catalog.plans : []), [catalog]);
  const activities = useMemo(() => (Array.isArray(catalog?.activities) ? catalog.activities : []), [catalog]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p?.name === selectedPlanName) || null,
    [plans, selectedPlanName]
  );

  const maxActivities = useMemo(() => {
    const n = Number(selectedPlan?.maxActivities);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [selectedPlan]);

  const isPremium = useMemo(
    () => String(selectedPlanName || "").toLowerCase() === "premium",
    [selectedPlanName]
  );

  const joinEnabled = useMemo(() => {
    if (!selectedPlan) return false;
    if (!activities.length) return false;

    if (isPremium) {
      return selectedActivities.length === activities.length && activities.length > 0;
    }
    return selectedActivities.length === maxActivities && maxActivities > 0;
  }, [selectedPlan, activities, selectedActivities, maxActivities, isPremium]);

  const isJoinedActive = useMemo(() => {
    if (!joinedUntil) return false;
    const until = new Date(joinedUntil).getTime();
    return Number.isFinite(until) && until > Date.now();
  }, [joinedUntil]);

  // Load catalog on open/type
  useEffect(() => {
    if (!open || !club) return;

    let alive = true;
    async function run() {
      try {
        setErr("");
        setLoading(true);
        setCatalog(null);
        setSelectedPlanName("");
        setSelectedActivities([]);
        setJoinedUntil(null);

        const data = await getClubCatalog(type);
        const normalized = data?.data ? data.data : data;

        if (!alive) return;
        setCatalog(normalized || { plans: [], activities: [] });
      } catch (e) {
        if (!alive) return;
        setErr(toErrMsg(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, [open, club, type]);

  // Plan change rules
  useEffect(() => {
    if (!selectedPlan) {
      setSelectedActivities([]);
      return;
    }

    if (String(selectedPlan?.name || "").toLowerCase() === "premium") {
      setSelectedActivities([...activities]); // auto select all
      return;
    }

    setSelectedActivities((prev) => prev.slice(0, maxActivities)); // trim
  }, [selectedPlanName, selectedPlan, activities, maxActivities]);

  if (!open || !club) return null;

  function toggleActivity(a) {
    if (!selectedPlan) return;
    if (isPremium) return; // locked

    setSelectedActivities((prev) => {
      const exists = prev.includes(a);
      if (exists) return prev.filter((x) => x !== a);

      if (prev.length >= maxActivities) return prev; // limit
      return [...prev, a];
    });
  }

  async function handleJoin() {
    if (!joinEnabled || joining || isJoinedActive) return;

    try {
      setErr("");
      setJoining(true);

      // ✅ backend do bllokojë memberships të tjera nëse ka 1 aktiv
      const res = await joinClub({
        clubId: club._id,
        planName: selectedPlanName,
        activities: selectedActivities
      });

      // supozojm backend kthen: { ok:true, data:{ membership:{ endAt } } } ose { data:{ endAt } }
      const m = res?.data?.membership || res?.data || null;
      const endAt = m?.endAt || m?.endsAt || null;

      if (!endAt) {
        // fallback: përdor durationDays nga plan (jo ideale, por funksionon)
        const days = Number(selectedPlan?.durationDays || 30);
        const until = new Date(Date.now() + days * 86400000).toISOString();
        setJoinedUntil(until);
      } else {
        setJoinedUntil(endAt);
      }
    } catch (e) {
      // nëse backend kthen 409 “ACTIVE_MEMBERSHIP_EXISTS”
      const code = e?.payload?.error?.code || e?.payload?.code || "";
      if (String(code).includes("ACTIVE_MEMBERSHIP_EXISTS")) {
        setErr("You already have an active membership. You can’t join another club until it expires.");
      } else {
        setErr(toErrMsg(e));
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="cdm-overlay" onMouseDown={onClose}>
      <div className="cdm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cdm-top">
          <div>
            <div className="cdm-title">{club.name}</div>
            <div className="cdm-sub">{club.type}</div>
          </div>
          <button className="cdm-x" type="button" onClick={onClose}>✕</button>
        </div>

        {loading ? <div className="cdm-banner">Loading…</div> : null}
        {err ? <div className="cdm-banner cdm-banner--err">{err}</div> : null}

        <div className="cdm-body">
          {club.coverImage ? (
            <img className="cdm-cover" src={club.coverImage} alt={club.name} />
          ) : (
            <div className="cdm-cover cdm-cover--empty" />
          )}

          {club.description ? <div className="cdm-desc">{club.description}</div> : null}
          {club.address ? (
            <div className="cdm-row">
              <span className="cdm-label">Address:</span> {club.address}
            </div>
          ) : null}

          <div className="cdm-divider" />

          <div className="cdm-sectionHead">
            <div className="cdm-sectionTitle">Choose subscription</div>
            <div className="cdm-hint">{selectedPlanName ? "Select activities below" : "Select a plan to continue"}</div>
          </div>

          <div className="cdm-planList">
            {plans.map((p) => {
              const active = p?.name === selectedPlanName;
              return (
                <button
                  key={`${p?.name}-${p?.durationDays}-${p?.maxActivities}`}
                  type="button"
                  className={`cdm-plan ${active ? "is-active" : ""}`}
                  onClick={() => setSelectedPlanName(p?.name || "")}
                  disabled={isJoinedActive} // s’ka kuptim të ndryshosh nëse je joined
                >
                  <div className="cdm-planName">{p?.name}</div>
                  <div className="cdm-planMeta">
                    {p?.durationDays} days • max activities: {p?.maxActivities}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="cdm-divider" />

          <div className="cdm-sectionHead">
            <div className="cdm-sectionTitle">Choose activities</div>
            <div className="cdm-hint">
              {!selectedPlanName
                ? "Select a plan first"
                : isPremium
                  ? `Selected: ${selectedActivities.length}/${activities.length}`
                  : `Selected: ${selectedActivities.length}/${maxActivities}`}
            </div>
          </div>

          {!selectedPlan ? (
            <div className="cdm-empty">Select a plan first.</div>
          ) : (
            <div className="cdm-chips">
              {activities.map((a) => {
                const checked = selectedActivities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    className={`cdm-chip ${checked ? "is-checked" : ""}`}
                    onClick={() => toggleActivity(a)}
                    disabled={isPremium || isJoinedActive}
                  >
                    <span className="cdm-chipText">{a}</span>
                    {checked ? <span className="cdm-chipTick">✓</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="cdm-actions">
          <button
            className="cdm-btn cdm-btnPrimary"
            type="button"
            onClick={handleJoin}
            disabled={!joinEnabled || joining || isJoinedActive}
          >
            {isJoinedActive ? "Joined" : (joining ? "Joining..." : "Join this club")}
          </button>

          <button className="cdm-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
