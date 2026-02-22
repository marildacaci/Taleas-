import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiGet } from "../api/client";
import ClubDetailsModal from "../components/modals/ClubDetailsModal";
import "../style/home.css";

function isActiveEndAt(endAt) {
  if (!endAt) return false;
  const t = new Date(endAt).getTime();
  return Number.isFinite(t) && t > Date.now();
}

export default function Home() {
  const { me, signOut } = useAuth();
  const nav = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const [joinedMap, setJoinedMap] = useState({});

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const username = useMemo(() => {
    if (!me) return "";
    return me?.username || me?.preferred_username || me?.name || me?.email?.split?.("@")?.[0] || "user";
  }, [me]);

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

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const res = await apiGet("/api/clubs/public");
      setClubs(res?.data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openClub(c) {
    setActive(c);
    setOpen(true);
  }

  function closeClub() {
    setOpen(false);
    setActive(null);
  }

  async function logout() {
    await signOut();
    nav("/login");
  }

  function handleJoined({ clubId, endAt }) {
    setJoinedMap((prev) => ({ ...prev, [clubId]: endAt }));
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-left">
          {me ? (
            <div className="home-profileWrap" ref={profileRef}>
              <button
                type="button"
                className="home-profileIconBtn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen ? "true" : "false"}
                title="Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {profileOpen ? (
                <div className="home-profileMenu" role="menu">
                  <div className="home-profileHeader">
                    <div className="home-avatar">{(me?.firstName || username).charAt(0).toUpperCase()}</div>
                    <div className="home-profileInfo">
                      <div className="home-profileName">{(me?.firstName || "").trim()} {(me?.lastName || "").trim()}</div>
                      <div className="home-profileEmail">{me?.email}</div>
                    </div>
                  </div>

                  <div className="home-divider" />

                  <div className="home-profileList">
                    <div className="home-profileRow">
                      <div className="home-profileLabel">Username</div>
                      <div className="home-profileValue">{username}</div>
                    </div>
                    <div className="home-profileRow">
                      <div className="home-profileLabel">Age</div>
                      <div className="home-profileValue">{me?.age ?? "—"}</div>
                    </div>
                    <div className="home-profileRow">
                      <div className="home-profileLabel">Phone</div>
                      <div className="home-profileValue">{me?.phoneNumber ?? "—"}</div>
                    </div>
                    <div className="home-profileRow">
                      <div className="home-profileLabel">Role</div>
                      <div className="home-profileValue">{me?.role ?? "user"}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="home-actions">
          <button className="home-btn" type="button" onClick={load}>
            Refresh
          </button>

          {me ? (
            <button className="home-btn home-btnDark" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link className="home-linkBtn" to="/login">
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="home-content">
        {loading ? <div className="home-muted">Loading…</div> : null}
        {err ? <div className="home-error">{err}</div> : null}

        <div className="home-grid">
          {clubs.map((c) => {
            const endAt = joinedMap[c._id];
            const joined = isActiveEndAt(endAt);

            return (
              <button
                key={c._id}
                className="home-card"
                onClick={() => openClub(c)}
                style={{ position: "relative" }}
              >
                {joined ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 10px",
                      borderRadius: 999,
                      zIndex: 2
                    }}
                  >
                    Joined
                  </div>
                ) : null}

                {c.coverImage ? (
                  <img className="home-cover" src={c.coverImage} alt={c.name} />
                ) : (
                  <div className="home-cover home-cover--empty" />
                )}

                <div className="home-cardBody">
                  <div className="home-cardTitle">{c.name}</div>
                  <div className="home-cardType">{c.type}</div>

                  {c.description ? (
                    <div className="home-cardDesc">
                      {c.description.length > 80 ? c.description.slice(0, 80) + "…" : c.description}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <ClubDetailsModal
        open={open}
        club={active}
        onClose={closeClub}
        onJoined={handleJoined}
      />
    </div>
  );
}
