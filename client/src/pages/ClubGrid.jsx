import React from "react";
import "../style/admin.css";

function Badge({ isPublic }) {
  return (
    <span className={`badge ${isPublic ? "public" : "private"}`}>
      {isPublic ? "PUBLIC" : "PRIVATE"}
    </span>
  );
}

function AddCard({ onClick }) {
  return (
    <div className="add-card" role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}>
      <div className="add-inner">
        <div className="add-title">Add Club</div>
        <button className="add-btn" type="button" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
          + Add Club
        </button>
      </div>
    </div>
  );
}

function ClubCard({ c, onEdit, onTogglePublic, onDelete }) {
  return (
    <div className="club-card">
      {c.coverImage ? (
        <img className="club-cover" src={c.coverImage} alt={c.name} />
      ) : (
        <div className="club-cover" />
      )}

      <div className="club-body">
        <div className="club-top">
          <div className="club-name">{c.name}</div>
          <Badge isPublic={Boolean(c.isPublic)} />
        </div>

        <div className="club-type">{c.type}</div>

        <div className="club-meta">
          Plans: <b>{c.plans?.length || 0}</b>
        </div>

        <div className="club-actions">
          <button className="btn" type="button" onClick={() => onEdit?.(c)}>
            Edit
          </button>

          <button className="btn" type="button" onClick={() => onTogglePublic?.(c)}>
            {c.isPublic ? "Private" : "Public"}
          </button>

          <button className="btn btn-danger" type="button" onClick={() => onDelete?.(c)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClubGrid({ clubs, onAdd, onEdit, onTogglePublic, onDelete }) {
  return (
    <div className="admin-grid">
      <AddCard onClick={onAdd} />

      {(clubs || []).map((c) => (
        <ClubCard
          key={c._id}
          c={c}
          onEdit={onEdit}
          onTogglePublic={onTogglePublic}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
