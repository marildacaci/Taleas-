import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, confirm, login, resendCode } from "../auth/authClient";
import { useAuth } from "../auth/AuthContext";
import "../style/auth.css";

export default function Register() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [pageMsg, setPageMsg] = useState("");
  const [modalMsg, setModalMsg] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [code, setCode] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const maskedEmail = useMemo(() => {
    const e = String(form.email || "");
    const at = e.indexOf("@");
    if (at <= 1) return e;
    return e.slice(0, 2) + "****" + e.slice(at);
  }, [form.email]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpenModal(false);
    }
    if (openModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal]);

  async function handleRegister(e) {
    e.preventDefault();
    setPageMsg("");
    setModalMsg("");

    const username = form.username.trim();
    const email = form.email.trim();

    if (!username || !email || !form.password) {
      return setPageMsg("Username, email and password are required.");
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return setPageMsg("Please enter a valid email address.");
    }

    try {
      setSubmitting(true);

      await register({ username, email, password: form.password });

      setCode("");
      setOpenModal(true);
      setModalMsg("Registration successful. Check your email for the verification code.");
    } catch (err) {
      const name = err?.name || "";
      const text = String(err?.message || "Registration failed.");

      if (text.includes("EMAIL_EXISTS")) {
        setPageMsg("This email is already in use. Please log in instead.");
        return;
      }

      if (name === "UsernameExistsException") {
        setPageMsg("This username is already taken. Please choose another one.");
        return;
      }

      if (name === "InvalidPasswordException") {
        setPageMsg("Password is too weak. Please use a stronger password.");
        return;
      }

      if (name === "InvalidParameterException" && /email/i.test(text)) {
        setPageMsg("Please enter a valid email address.");
        return;
      }

      setPageMsg(text);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    setModalMsg("");

    const username = form.username.trim();
    if (!username) return setModalMsg("Missing username for confirmation.");
    if (!code.trim()) return setModalMsg("Verification code is required.");

    try {
      setSubmitting(true);

      await confirm({ username, code: code.trim() });
      await login({ identifier: username, password: form.password });

      const me = await refresh();

      setOpenModal(false);
      nav(me?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const name = err?.name || "";
      const text = String(err?.message || "Confirmation failed.");

      if (
        name === "CodeMismatchException" ||
        name === "ExpiredCodeException" ||
        /Invalid code/i.test(text)
      ) {
        setModalMsg("Invalid or expired code. Please try again or resend a new code.");
        return;
      }

      setModalMsg(text);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setModalMsg("");
    const username = form.username.trim();
    if (!username) return setModalMsg("Username is required to resend code.");
    if (cooldown > 0) return;

    try {
      await resendCode({ username });
      setModalMsg(`A new code was sent to ${maskedEmail || "your email"}.`);

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
      setModalMsg(err?.message || "Resend failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Register</h2>
          <p className="auth-subtitle">Create a new account.</p>
        </div>

        {pageMsg && <div className="auth-alert">{pageMsg}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
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
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
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
              {submitting ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <Link className="auth-link" to="/login">
            Already have an account? Login
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
          <div className="auth-modal">
            <div className="auth-modal-header">
              <h3 className="auth-modal-title">Verify your email</h3>
              <p className="auth-modal-subtitle">
                Enter the verification code sent to <b>{maskedEmail}</b>.
              </p>
            </div>

            {modalMsg && <div className="auth-alert">{modalMsg}</div>}

            <div className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Verification Code</label>
                <input
                  className="auth-input"
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="auth-modal-actions">
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  Confirm & Login
                </button>

                <button
                  type="button"
                  className="auth-btn secondary"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>

                <button
                  type="button"
                  className="auth-btn danger"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </button>
              </div>

              <div className="auth-note">
                Tip: Check Spam/Promotions if you don’t see the email.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
