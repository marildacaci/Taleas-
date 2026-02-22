import React from "react";

export default function ClubCard({ club, onOpen }) {
  return (
    <div
      onClick={() => onOpen?.(club)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(club);
      }}
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        cursor: "pointer"
      }}
    >
      {club.coverImage ? (
        <img
          src={club.coverImage}
          alt={club.name}
          style={{ width: "100%", height: 160, objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: 160, background: "#f2f2f2" }} />
      )}

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>{club.name}</h3>
          <span
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              background: "#f5f5f5",
              border: "1px solid #eee",
              height: "fit-content"
            }}
          >
            {club.type}
          </span>
        </div>

        {club.description && (
          <p style={{ marginTop: 10, marginBottom: 0, color: "#444" }}>
            {club.description}
          </p>
        )}

        {club.address && (
          <p style={{ marginTop: 8, marginBottom: 0, color: "#666", fontSize: 13 }}>
            📍 {club.address}
          </p>
        )}

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // mos e double-trigger click
              onOpen?.(club);
            }}
            style={{
              border: "1px solid #ddd",
              background: "#111",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer"
            }}
          >
            View / Join
          </button>
        </div>
      </div>
    </div>
  );
}
