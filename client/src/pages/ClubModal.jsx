import React, { useEffect, useMemo, useState } from "react";
import { getPresignedCoverUrl, uploadToS3 } from "../api/uploads";
import { getClubCatalog } from "../api/catalog";
import "../style/admin.css";

function Field({ label, children }) {
  return (
    <div className="am-field">
      <div className="am-label">{label}</div>
      {children}
    </div>
  );
}

function ActivitiesChips({ items = [] }) {
  if (!items.length) return <div className="am-muted">No activities.</div>;
  return (
    <div className="am-chips">
      {items.map((a) => (
        <span key={a} className="am-chip">
          {a}
        </span>
      ))}
    </div>
  );
}

function toErrMsg(e) {
  return (
    e?.payload?.message ||
    e?.payload?.error?.message ||
    e?.message ||
    "Something went wrong."
  );
}

export default function ClubModal({
  open,
  title,
  isEdit,
  form,
  onChange,
  onClose,
  onSave
}) {
  const [uploading, setUploading] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogErr, setCatalogErr] = useState("");

  const [formError, setFormError] = useState("");

  const type = useMemo(() => form?.type || "fitness", [form?.type]);

  useEffect(() => {
    if (!open) {
      setFormError("");
      setCatalogErr("");
    } else {
      setFormError("");
    }
  }, [open]);

  async function loadCatalog(t) {
    try {
      setCatalogErr("");
      setLoadingCatalog(true);

      const data = await getClubCatalog(t);

      const plans = Array.isArray(data?.plans) ? data.plans : [];
      const activities = Array.isArray(data?.activities) ? data.activities : [];
      const desc = typeof data?.description === "string" ? data.description : "";

      onChange("plans", plans);
      onChange("activities", activities);

      onChange("description", desc);
    } catch (e) {
      setCatalogErr(toErrMsg(e) || "Failed to load catalog.");
    } finally {
      setLoadingCatalog(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadCatalog(type);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    loadCatalog(type);
  }, [type]);

  if (!open) return null;

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Only JPG / PNG / WebP images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setFormError("Max image size is 3MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const { uploadUrl, publicUrl } = await getPresignedCoverUrl(file);
      await uploadToS3(uploadUrl, file);
      onChange("coverImage", publicUrl);
    } catch (err) {
      setFormError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function validate() {
    setFormError("");

    const name = String(form?.name || "").trim();
    const address = String(form?.address || "").trim();
    const coverImage = String(form?.coverImage || "").trim();
    const desc = String(form?.description || "").trim();
    const t = String(form?.type || "").trim();

    if (!name) return "Name is required.";
    if (!t) return "Type is required.";
    if (!desc) return "Description (from catalog) is missing.";
    if (!address) return "Address is required.";
    if (!coverImage) return "Cover image is required.";

    if (!Array.isArray(form?.plans) || form.plans.length === 0) {
      return "Plans are missing. Please reload and try again.";
    }
    if (!Array.isArray(form?.activities) || form.activities.length === 0) {
      return "Activities are missing. Please reload and try again.";
    }

    for (const p of form.plans) {
      const pn = String(p?.name || "").trim();
      const dd = Number(p?.durationDays);
      const ma = Number(p?.maxActivities);
      if (!pn) return "Plan name is missing.";
      if (!Number.isFinite(dd) || dd < 1) return "Plan durationDays is invalid.";
      if (!Number.isFinite(ma) || ma < 1) return "Plan maxActivities is invalid.";
    }

    return "";
  }

  async function handleSubmit() {
    if (uploading || loadingCatalog) return;

    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    try {
      await onSave?.();
    } catch (e) {
      setFormError(toErrMsg(e));
    }
  }

  return (
    <div className="am-overlay" onMouseDown={onClose}>
      <div className="am-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="am-top">
          <div className="am-title">{title}</div>
          <button className="am-iconbtn" onClick={onClose} disabled={uploading}>
            ✕
          </button>
        </div>

        {formError ? <div className="am-topError">{formError}</div> : null}
        {catalogErr ? <div className="am-topError">{catalogErr}</div> : null}

        <div className="am-body">
          <Field label="Name">
            <input
              className="am-input"
              value={form.name ?? ""}
              onChange={(e) => {
                setFormError("");
                onChange("name", e.target.value);
              }}
              placeholder="e.g. Reboot Fitness"
            />
          </Field>

          <Field label="Type">
            <select
              className="am-select"
              value={type}
              onChange={(e) => {
                setFormError("");
                onChange("type", e.target.value);
              }}
              disabled={loadingCatalog}
            >
              <option value="fitness">fitness</option>
              <option value="dance">dance</option>
              <option value="coding">coding</option>
            </select>
          </Field>

          <Field label="Description">
            <div className="am-descriptionBox">
              {loadingCatalog ? "Loading description..." : form.description || "No description"}
            </div>
          </Field>

          <Field label="Address">
            <input
              className="am-input"
              value={form.address ?? ""}
              onChange={(e) => {
                setFormError("");
                onChange("address", e.target.value);
              }}
              placeholder="Street, City"
            />
          </Field>

          <Field label="Cover Image">
            <input
              className="am-file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleCoverUpload}
            />

            {form.coverImage ? (
              <div className="am-coverRow">
                <img className="am-coverThumb" src={form.coverImage} alt="cover" />
                <button
                  className="am-btn"
                  type="button"
                  onClick={() => {
                    setFormError("");
                    onChange("coverImage", "");
                  }}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </Field>

          <div className="am-section">
            <div className="am-sectionTitle">Visibility</div>
            <label className="am-checkRow">
              <input
                type="checkbox"
                checked={Boolean(form.isPublic)}
                onChange={(e) => {
                  setFormError("");
                  onChange("isPublic", e.target.checked);
                }}
              />
              <span>Public (shows in Home)</span>
            </label>
          </div>

          <div className="am-section">
            <div className="am-sectionTitle">Plans </div>
            {loadingCatalog ? <div className="am-muted">Loading plans...</div> : null}

            <div className="am-planList">
              {(form.plans || []).map((p) => (
                <div key={`${p.name}-${p.durationDays}-${p.maxActivities}`} className="am-planRow">
                  <div className="am-planName">{p.name}</div>

                  <div className="am-planMeta">
                    {p.durationDays} days • max activities: {p.maxActivities}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="am-section">
            <div className="am-sectionTitle">Activities</div>
            {loadingCatalog ? <div className="am-muted">Loading activities...</div> : null}

            {!catalogErr ? (
              <>
                <ActivitiesChips items={form.activities || []} />
                <div className="am-muted" style={{ marginTop: 8 }}>
                  Total: <b>{(form.activities || []).length}</b>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="am-actions">
          <button
            className="am-btn am-btnPrimary"
            type="button"
            onClick={handleSubmit}
            disabled={uploading || loadingCatalog}
          >
            {isEdit ? "Save" : "Create"}
          </button>

          <button className="am-btn" type="button" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
