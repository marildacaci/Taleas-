import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, confirm, resendCode } from "../auth/authClient";
import { useAuth } from "../auth/AuthContext";
import "../style/auth.css";

export default function Login() {
  const nav = useNavigate();
  const { me, loading, refresh } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [code, setCode] = useState("");
  const [pendingUsername, setPendingUsername] = useState(""); // username to confirm against
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (me) nav(me.role === "admin" ? "/admin" : "/");
  }, [loading, me, nav]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpenModal(false);
    }
    if (openModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    const id = identifier.trim();
    if (!id) return setMsg("Username or email is required.");
    if (!password) return setMsg("Password is required.");

    try {
      setSubmitting(true);

      await login({ identifier: id, password });

      const user = await refresh();
      nav(user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const name = err?.name || "";
      const message = String(err?.message || "");

      if (name === "UserNotConfirmedException" || /not confirmed/i.test(message)) {
        setPendingUsername(id);
        setCode("");
        setOpenModal(true);
        setMsg("Your account is not verified. Enter the code we emailed you.");
        return;
      }

      if (message.includes("already a signed in user")) {
        const user = await refresh();
        nav(user?.role === "admin" ? "/admin" : "/");
        return;
      }

      setMsg(message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    setMsg("");
    if (!pendingUsername) return setMsg("Missing username for confirmation.");
    if (!code.trim()) return setMsg("Verification code is required.");

    try {
      setSubmitting(true);

      await confirm({ username: pendingUsername, code: code.trim() });

      await login({ identifier: pendingUsername, password });

      const user = await refresh();
      setOpenModal(false);
      nav(user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const message = String(err?.message || "");
      setMsg(message || "Confirmation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setMsg("");
    const u = pendingUsername || identifier.trim();
    if (!u) return setMsg("Username is required to resend code.");
    if (cooldown > 0) return;

    try {
      await resendCode({ username: u });
      setMsg("A new verification code was sent to your email.");

      setCooldown(60);
      const t = setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) {
            clearInterval(t);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      setMsg(err?.message || "Resend failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Login</h2>
          <p className="auth-subtitle">Sign in using your username or email.</p>
        </div>

        {msg && <div className="auth-alert">{msg}</div>}

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label">Username / Email</label>
            <input
              className="auth-input"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-actions">
            <button type="submit" className={`auth-btn ${submitting ? "loading" : ""}`}>
              {submitting ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <Link className="auth-link" to="/register">
            Create account
          </Link>
        </div>
      </div>

      {openModal && (
        <div
          className="auth-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpenModal(false);
          }}
        >
          <div className="auth-modal" role="dialog" aria-modal="true">
            <div className="auth-modal-header">
              <h3 className="auth-modal-title">Verify your account</h3>
              <p className="auth-modal-subtitle">
                Enter the verification code sent to your email.
              </p>
            </div>

            {msg && <div className="auth-alert">{msg}</div>}

            <div className="auth-form" style={{ gap: 12 }}>
              <div className="auth-field">
                <label className="auth-label">Verification Code</label>
                <input
                  className="auth-input"
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoFocus
                  disabled={submitting}
                />
              </div>

              <div className="auth-modal-actions">
                <button
                  type="button"
                  className={`auth-btn ${submitting ? "loading" : ""}`}
                  onClick={handleConfirm}
                >
                  {submitting ? "Confirming..." : "Confirm & Login"}
                </button>

                <button
                  type="button"
                  className="auth-btn secondary"
                  onClick={handleResend}
                  disabled={cooldown > 0 || submitting}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>

                <button
                  type="button"
                  className="auth-btn danger"
                  onClick={() => setOpenModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>

              <div className="auth-note" style={{ textAlign: "center" }}>
                Tip: Check Spam/Promotions if you don’t see the email.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
