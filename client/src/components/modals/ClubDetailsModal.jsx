// src/components/modals/ClubDetailsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getClubCatalog } from "../../api/catalog";
import "../../style/clubDetailsModal.css";

function toErrMsg(e) {
  return (
    e?.payload?.message ||
    e?.payload?.error?.message ||
    e?.message ||
    "Something went wrong."
  );
}

export default function ClubDetailsModal({ open, club, onClose, onJoin }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [catalog, setCatalog] = useState(null);

  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);

  const type = useMemo(() => club?.type || "fitness", [club?.type]);

  const plans = useMemo(() => {
    const list = catalog?.plans;
    return Array.isArray(list) ? list : [];
  }, [catalog]);

  const activities = useMemo(() => {
    const list = catalog?.activities;
    return Array.isArray(list) ? list : [];
  }, [catalog]);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p?.name === selectedPlanName) || null;
  }, [plans, selectedPlanName]);

  const maxActivities = useMemo(() => {
    const n = Number(selectedPlan?.maxActivities);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [selectedPlan]);

  const canPickActivities = Boolean(selectedPlan && maxActivities > 0);

  const joinEnabled = useMemo(() => {
    if (!selectedPlan) return false;
    if (!activities.length) return false;

    // Premium: auto all selected
    if (selectedPlanName.toLowerCase() === "premium") {
      return selectedActivities.length === activities.length && activities.length > 0;
    }

    // Basic (or others): must pick exactly maxActivities
    return selectedActivities.length === maxActivities && maxActivities > 0;
  }, [selectedPlan, selectedPlanName, activities, selectedActivities, maxActivities]);

  // Load catalog when opens / type changes
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

        const data = await getClubCatalog(type);

        // tolerant parsing (in case backend wraps it differently)
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
    return () => {
      alive = false;
    };
  }, [open, club, type]);

  // When plan changes -> update activity selection rules
  useEffect(() => {
    if (!selectedPlan) {
      setSelectedActivities([]);
      return;
    }

    const planLower = String(selectedPlan?.name || "").toLowerCase();

    // Premium => auto select all + lock
    if (planLower === "premium") {
      setSelectedActivities([...activities]);
      return;
    }

    // Basic/other => keep only up to maxActivities
    setSelectedActivities((prev) => prev.slice(0, maxActivities));
  }, [selectedPlanName, selectedPlan, activities, maxActivities]);

  if (!open || !club) return null;

  function toggleActivity(a) {
    if (!selectedPlan) return;
    const planLower = String(selectedPlan?.name || "").toLowerCase();
    if (planLower === "premium") return; // locked

    setSelectedActivities((prev) => {
      const exists = prev.includes(a);
      if (exists) return prev.filter((x) => x !== a);

      // limit
      if (prev.length >= maxActivities) return prev;
      return [...prev, a];
    });
  }

  function handleJoin() {
    if (!joinEnabled) return;

    const payload = {
      clubId: club._id,
      planName: selectedPlanName,
      activities: selectedActivities
    };

    // onJoin optional (you can hook to backend membership create)
    if (typeof onJoin === "function") onJoin(payload);

    onClose?.();
  }

  return (
    <div className="cdm-overlay" onMouseDown={onClose}>
      <div className="cdm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cdm-top">
          <div>
            <div className="cdm-title">{club.name}</div>
            <div className="cdm-sub">{club.type}</div>
          </div>

          <button className="cdm-x" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
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
            <div className="cdm-hint">
              {selectedPlanName ? "Select activities below" : "Select a plan to continue"}
            </div>
          </div>

          {!plans.length ? (
            <div className="cdm-empty">No plans available.</div>
          ) : (
            <div className="cdm-planList">
              {plans.map((p) => {
                const active = p?.name === selectedPlanName;
                return (
                  <button
                    key={`${p?.name}-${p?.durationDays}-${p?.maxActivities}`}
                    type="button"
                    className={`cdm-plan ${active ? "is-active" : ""}`}
                    onClick={() => setSelectedPlanName(p?.name || "")}
                  >
                    <div className="cdm-planName">{p?.name}</div>
                    <div className="cdm-planMeta">
                      {p?.durationDays} days • max activities: {p?.maxActivities}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="cdm-divider" />

          <div className="cdm-sectionHead">
            <div className="cdm-sectionTitle">Choose activities</div>
            <div className="cdm-hint">
              {selectedPlanName ? `Selected: ${selectedActivities.length}/${maxActivities || activities.length}` : "Select a plan first"}
            </div>
          </div>

          {!selectedPlan ? (
            <div className="cdm-empty">Select a plan first.</div>
          ) : !activities.length ? (
            <div className="cdm-empty">
              No activities found in catalog.
            </div>
          ) : (
            <div className="cdm-chips">
              {activities.map((a) => {
                const checked = selectedActivities.includes(a);
                const premiumLock = String(selectedPlanName).toLowerCase() === "premium";
                const disabled = premiumLock;

                return (
                  <button
                    key={a}
                    type="button"
                    className={`cdm-chip ${checked ? "is-checked" : ""}`}
                    onClick={() => toggleActivity(a)}
                    disabled={disabled}
                    title={disabled ? "Premium selects all activities automatically" : ""}
                  >
                    {a}
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
            disabled={!joinEnabled}
            title={!joinEnabled ? "Complete plan + activity selection first" : ""}
          >
            Join this club
          </button>
          <button className="cdm-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
