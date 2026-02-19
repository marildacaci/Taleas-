import React, { useEffect, useRef, useState } from "react";
import "../../style/user.css";

export default function UserHeader({ me, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const username =
    me?.username ||
    me?.preferred_username ||
    me?.name ||
    me?.email?.split?.("@")?.[0] ||
    "user";

  useEffect(() => {
    function onDocDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="user-header">
      <div className="user-header__inner">
        <div className="user-brand">Club App</div>

        <div className="user-header__right">
          {!me ? (
            <div className="user-authLinks">
              <a className="user-link" href="/login">Login</a>
              <a className="user-link" href="/register">Register</a>
            </div>
          ) : (
            <>
              <div className="user-profileWrap" ref={ref}>
                <button
                  type="button"
                  className="user-profileIconBtn"
                  onClick={() => setOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={open ? "true" : "false"}
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

                {open ? (
                  <div className="user-profileMenu" role="menu">
                    <div className="user-profileHeader">
                      <div className="user-avatar">
                        {String(username).charAt(0).toUpperCase()}
                      </div>
                      <div className="user-profileInfo">
                        <div className="user-profileName">{username}</div>
                        <div className="user-profileEmail">{me.email}</div>
                      </div>
                    </div>

                    <div className="user-divider" />

                    <div className="user-profileRow">
                      <div className="user-profileLabel">First name</div>
                      <div className="user-profileValue">{me.firstName || "—"}</div>
                    </div>
                    <div className="user-profileRow">
                      <div className="user-profileLabel">Last name</div>
                      <div className="user-profileValue">{me.lastName || "—"}</div>
                    </div>
                    <div className="user-profileRow">
                      <div className="user-profileLabel">Phone</div>
                      <div className="user-profileValue">{me.phoneNumber || "—"}</div>
                    </div>
                    <div className="user-profileRow">
                      <div className="user-profileLabel">Age</div>
                      <div className="user-profileValue">{me.age ?? "—"}</div>
                    </div>

                    <div className="user-divider" />

                    <div className="user-roleRow">
                      <span className="user-roleLabel">Role</span>
                      <span className="user-rolePill">{String(me.role || "user").toUpperCase()}</span>
                    </div>

                    <button className="user-menuLogout" type="button" onClick={onLogout}>
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>

              <button className="user-btn" type="button" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
