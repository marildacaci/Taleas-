import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  adminListClubs,
  adminCreateClub,
  adminUpdateClub,
  adminDeleteClub,
  adminSetVisibility
} from "../api/adminClubs";

import ClubGrid from "./ClubGrid";
import ClubModal from "./ClubModal";
import "../style/admin.css";

const DEFAULT_PLANS = [
  { name: "Basic", durationDays: 30, price: 20, maxActivities: 5 },
  { name: "Premium", durationDays: 30, price: 35, maxActivities: 10 }
];

const EMPTY = {
  name: "",
  type: "fitness",
  description: "",
  address: "",
  coverImage: "",
  isPublic: false,
  plans: [],
  activities: []
};

export default function AdminDashboard() {
  const { me, signOut } = useAuth();
  const nav = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null); 
  const toastTimerRef = useRef(null);

  function showToast(type, text, ms = 2500) {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), ms);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const isEdit = useMemo(() => Boolean(editing?._id), [editing]);

  async function load() {
    try {
      setLoading(true);
      const res = await adminListClubs();
      setClubs(res?.data || []);
    } catch (e) {
      showToast("error", e?.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    await signOut();
    nav("/");
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, plans: DEFAULT_PLANS });
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name || "",
      type: c.type || "fitness",
      description: c.description || "",
      address: c.address || "",
      coverImage: c.coverImage || "",
      isPublic: Boolean(c.isPublic),
      plans: Array.isArray(c.plans) && c.plans.length ? c.plans : DEFAULT_PLANS,
      activities: Array.isArray(c.activities) ? c.activities : []
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validatePlans(plans) {
    if (!Array.isArray(plans) || plans.length === 0) return "Plans missing";
    for (const p of plans) {
      if (!p?.name?.trim()) return "Plan name missing";
      if (!Number.isFinite(Number(p?.durationDays)) || Number(p.durationDays) < 1)
        return "Plan duration invalid";
      if (p?.price !== undefined && (!Number.isFinite(Number(p?.price)) || Number(p.price) < 0))
        return "Plan price invalid";
      if (p?.maxActivities !== undefined && (!Number.isFinite(Number(p?.maxActivities)) || Number(p.maxActivities) < 0))
        return "Plan maxActivities invalid";
    }
    return null;
  }

  async function save() {
    try {
      if (!form.name.trim()) throw new Error("Name is required");
      if (!form.type) throw new Error("Type is required");

      const planErr = validatePlans(form.plans);
      if (planErr) throw new Error(planErr);

      const payload = {
        name: form.name,
        type: form.type,

        description: form.description,

        address: form.address,
        coverImage: form.coverImage,
        isPublic: Boolean(form.isPublic),

        plans: form.plans,
        activities: form.activities
      };

      if (isEdit) {
        await adminUpdateClub(editing._id, payload);
        showToast("success", "Club updated ✅");
      } else {
        await adminCreateClub(payload);
        showToast("success", "Club created ✅");
      }

      closeModal();
      await load();
    } catch (e) {
      showToast("error", e?.message || "Save failed");
    }
  }

  async function togglePublic(c) {
    const next = !c.isPublic;
    setClubs((prev) => prev.map((x) => (x._id === c._id ? { ...x, isPublic: next } : x)));

    try {
      await adminSetVisibility(c._id, next);
      showToast("success", next ? "Club is now PUBLIC ✅" : "Club is now PRIVATE ✅");
    } catch (e) {
      setClubs((prev) => prev.map((x) => (x._id === c._id ? { ...x, isPublic: c.isPublic } : x)));
      showToast("error", e?.message || "Visibility update failed");
    }
  }

  async function removeClub(c) {
    if (!confirm(`Delete "${c.name}"?`)) return;

    setClubs((prev) => prev.filter((x) => x._id !== c._id));

    try {
      await adminDeleteClub(c._id);

      if (editing?._id === c._id) {
        setEditing(null);
        setForm(EMPTY);
        setModalOpen(false);
      }

      showToast("success", "Club deleted ✅");
    } catch (e) {
      const code = e?.payload?.error?.code || e?.payload?.code || e?.payload?.error || "";

      if (String(code).includes("CLUB_HAS_ACTIVE_MEMBERSHIPS")) {
        showToast("error", "You can't delete this club because it has an active membership.");
        await load();
        return;
      }

      showToast("error", e?.message || "Delete failed");
      await load();
    }
  }

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (me?.role !== "admin") {
    return (
      <div className="admin-page">
        <div className="admin-content">
          <p style={{ color: "#b00020", fontWeight: 900 }}>403 - Admin only</p>
        </div>
      </div>
    );
  }

  const username =
    me?.username || me?.preferred_username || me?.name || me?.email?.split?.("@")?.[0] || "admin";

  return (
    <div className="admin-page">
      {toast ? <div className={`admin-toast ${toast.type}`}>{toast.text}</div> : null}

      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <div className="admin-profileWrap" ref={profileRef}>
              <button
                type="button"
                className="admin-profileIconBtn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen ? "true" : "false"}
                title="Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 21a8 8 0 1 0-16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {profileOpen ? (
                <div className="admin-profileMenu" role="menu">
                  <div className="admin-profileHeader">
                    <div className="admin-avatar">{username.charAt(0).toUpperCase()}</div>
                    <div className="admin-profileInfo">
                      <div className="admin-profileName">{username}</div>
                      <div className="admin-profileEmail">{me?.email}</div>
                    </div>
                  </div>

                  <div className="admin-divider" />

                  <div className="admin-roleRow">
                    <span className="admin-roleLabel">Role</span>
                    <span className="admin-rolePill">Admin</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="admin-actions">
            <button className="btn" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-content">
        {loading ? <div className="helper-muted">Loading...</div> : null}

        <ClubGrid
          clubs={clubs}
          onAdd={openCreate}
          onEdit={openEdit}
          onTogglePublic={togglePublic}
          onDelete={removeClub}
        />

        <ClubModal
          open={modalOpen}
          title={isEdit ? "Edit Club" : "Add Club"}
          isEdit={isEdit}
          form={form}
          onChange={setField}
          onClose={closeModal}
          onSave={save}
        />
      </main>
    </div>
  );
}
