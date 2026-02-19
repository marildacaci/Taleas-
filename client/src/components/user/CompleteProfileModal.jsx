import React, { useEffect, useMemo, useState } from "react";
import "../../style/user.css";

function isEmpty(v) {
  return v === undefined || v === null || String(v).trim() === "";
}

export default function CompleteProfileModal({ open, initialValues, onCloseBlocked, onSave }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    age: ""
  });

  const [topErr, setTopErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTopErr("");
    setSaving(false);

    setForm({
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      phoneNumber: initialValues?.phoneNumber || "",
      age: initialValues?.age ?? ""
    });
  }, [open, initialValues]);

  const missing = useMemo(() => {
    const m = [];
    if (isEmpty(form.firstName)) m.push("First name");
    if (isEmpty(form.lastName)) m.push("Last name");
    if (isEmpty(form.phoneNumber)) m.push("Phone number");
    if (isEmpty(form.age)) m.push("Age");
    return m;
  }, [form]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    if (missing.length) return `Please fill: ${missing.join(", ")}.`;

    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      return "Age must be a valid number.";
    }

    const phone = String(form.phoneNumber).trim();
    if (phone.length < 6) return "Phone number looks too short.";

    return "";
  }

  async function submit() {
    const err = validate();
    if (err) {
      setTopErr(err);
      return;
    }

    try {
      setSaving(true);
      setTopErr("");

      await onSave({
        firstName: String(form.firstName).trim(),
        lastName: String(form.lastName).trim(),
        phoneNumber: String(form.phoneNumber).trim(),
        age: Number(form.age)
      });
    } catch (e) {
      setTopErr(e?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="up-overlay" onMouseDown={(e) => e.preventDefault()}>
      <div className="up-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="up-top">
          <div className="up-title">Complete your profile</div>
          <button type="button" className="up-iconbtn" onClick={onCloseBlocked} title="Complete profile to continue">
            ✕
          </button>
        </div>

        {topErr ? <div className="up-topError">{topErr}</div> : null}

        <div className="up-body">
          <div className="up-muted">
            This is your first time here. Please complete your info to continue.
          </div>

          <div className="up-field">
            <div className="up-label">First name</div>
            <input
              className="up-input"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              placeholder="e.g. Marilda"
              disabled={saving}
            />
          </div>

          <div className="up-field">
            <div className="up-label">Last name</div>
            <input
              className="up-input"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="e.g. Caci"
              disabled={saving}
            />
          </div>

          <div className="up-field">
            <div className="up-label">Phone number</div>
            <input
              className="up-input"
              value={form.phoneNumber}
              onChange={(e) => setField("phoneNumber", e.target.value)}
              placeholder="e.g. +355..."
              disabled={saving}
            />
          </div>

          <div className="up-field">
            <div className="up-label">Age</div>
            <input
              className="up-input"
              value={form.age}
              onChange={(e) => setField("age", e.target.value)}
              placeholder="e.g. 21"
              disabled={saving}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="up-actions">
          <button className="up-btn up-btnPrimary" type="button" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
