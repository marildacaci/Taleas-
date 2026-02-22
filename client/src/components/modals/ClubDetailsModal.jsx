import React, { useEffect, useMemo, useState } from "react";
import { joinClub } from "../../api/memberships";
import "../../style/clubDetailsModal.css";

function toErrMsg(e) {
  return e?.payload?.message || e?.payload?.error?.message || e?.message || "Something went wrong.";
}

function daysLeft(endAt) {
  if (!endAt) return null;
  const ms = new Date(endAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  const d = Math.ceil(ms / 86400000);
  return d > 0 ? d : 0;
}

function planKey(p, idx) {
  if (p?._id) return String(p._id);
  return `${String(p?.name || "plan").trim()}-${Number(p?.durationDays || 0)}-${Number(p?.maxActivities || 0)}-${idx}`;
}

export default function ClubDetailsModal({ open, club, onClose }) {
  const [err, setErr] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [joining, setJoining] = useState(false);
  const [joinedUntil, setJoinedUntil] = useState(null);

  const plans = useMemo(() => (Array.isArray(club?.plans) ? club.plans : []), [club]);

  const activities = useMemo(() => {
    if (Array.isArray(club?.activities)) {
      return club.activities.map((x) => String(x || "").trim()).filter(Boolean);
    }
    return [];
  }, [club]);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return (
      plans.find((p, idx) => planKey(p, idx) === String(selectedPlanId)) || null
    );
  }, [plans, selectedPlanId]);

  const maxActivities = useMemo(() => {
    const n = Number(selectedPlan?.maxActivities);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [selectedPlan]);

  const isPremium = useMemo(() => {
    if (!selectedPlan) return false;
    if (activities.length > 0 && maxActivities >= activities.length) return true;
    return String(selectedPlan?.name || "").toLowerCase() === "premium";
  }, [selectedPlan, maxActivities, activities.length]);

  const joinEnabled = useMemo(() => {
    if (!selectedPlan) return false;
    if (!activities.length) return false;
    if (isPremium) return selectedActivities.length === activities.length && activities.length > 0;
    return maxActivities > 0 && selectedActivities.length === maxActivities;
  }, [selectedPlan, activities, selectedActivities, maxActivities, isPremium]);

  const isJoinedActive = useMemo(() => {
    if (!joinedUntil) return false;
    const until = new Date(joinedUntil).getTime();
    return Number.isFinite(until) && until > Date.now();
  }, [joinedUntil]);

  const joinedDaysLeft = useMemo(() => daysLeft(joinedUntil), [joinedUntil]);

  useEffect(() => {
    if (!open || !club) return;
    setErr("");
    setSelectedPlanId("");
    setSelectedActivities([]);
    setJoinedUntil(null);
  }, [open, club?._id]);

  useEffect(() => {
    if (!selectedPlan) {
      setSelectedActivities([]);
      return;
    }
    if (isPremium) {
      setSelectedActivities([...activities]);
      return;
    }
    setSelectedActivities((prev) => prev.slice(0, maxActivities));
  }, [selectedPlanId, isPremium, activities, maxActivities, selectedPlan]);

  if (!open || !club) return null;

  function toggleActivity(a) {
    if (!selectedPlan) return;
    if (isPremium) return;
    if (!maxActivities) return;

    setSelectedActivities((prev) => {
      const exists = prev.includes(a);
      if (exists) return prev.filter((x) => x !== a);
      if (prev.length >= maxActivities) return prev;
      return [...prev, a];
    });
  }

  async function handleJoin() {
    if (!joinEnabled || joining || isJoinedActive) return;

    try {
      setErr("");
      setJoining(true);

      const res = await joinClub({
        clubId: club._id,
        planId: selectedPlan?._id ? String(selectedPlan._id) : null,
        selectedActivities
      });

      const m = res?.data?.membership || res?.data || null;
      const endAt = m?.endAt || null;

      if (!endAt) {
        const days = Number(selectedPlan?.durationDays || 30);
        setJoinedUntil(new Date(Date.now() + days * 86400000).toISOString());
      } else {
        setJoinedUntil(endAt);
      }
    } catch (e) {
      setErr(toErrMsg(e));
    } finally {
      setJoining(false);
    }
  }

  const selectionHint = !selectedPlan
    ? "Select a plan first"
    : isPremium
      ? `Selected: ${selectedActivities.length}/${activities.length}`
      : `Selected: ${selectedActivities.length}/${maxActivities}`;

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
            <div className="cdm-hint">{selectedPlan ? "Select activities below" : "Select a plan to continue"}</div>
          </div>

          {!plans.length ? (
            <div className="cdm-empty">No plans set by admin yet.</div>
          ) : (
            <div className="cdm-planList">
              {plans.map((p, idx) => {
                const pid = planKey(p, idx);
                const active = pid === String(selectedPlanId);

                return (
                  <button
                    key={pid}
                    type="button"
                    className={`cdm-plan ${active ? "is-active" : ""}`}
                    onClick={() => setSelectedPlanId(pid)}
                    disabled={isJoinedActive || joining}
                  >
                    <div className="cdm-planName">{p?.name}</div>
                    <div className="cdm-planMeta">
                      {p?.durationDays ?? "-"} days • max activities: {p?.maxActivities ?? "-"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="cdm-divider" />

          <div className="cdm-sectionHead">
            <div className="cdm-sectionTitle">Choose activities</div>
            <div className="cdm-hint">{selectionHint}</div>
          </div>

          {!selectedPlan ? (
            <div className="cdm-empty">Select a plan first.</div>
          ) : !activities.length ? (
            <div className="cdm-empty">No activities set by admin yet.</div>
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
                    disabled={isPremium || isJoinedActive || joining}
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
            {isJoinedActive
              ? `Joined${joinedDaysLeft !== null ? ` (${joinedDaysLeft} days left)` : ""}`
              : (joining ? "Joining..." : "Join this club")}
          </button>

          <button className="cdm-btn" type="button" onClick={onClose} disabled={joining}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
