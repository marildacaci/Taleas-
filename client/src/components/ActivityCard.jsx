import { t } from "../i18n";

function fmt(date) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "-";
  }
}

export default function ActivityCard({ activity, lang }) {
  return (
    <div className="clubCard">
      <div className="clubTop">
        <div>
          <div className="clubName">{activity.title}</div>
          <div className="clubMeta">
            <span className="pill">
              {t(lang, "type")}: {activity.activityType || "class"}
            </span>
            <span className="pill">
              Capacity: {activity.capacity ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="clubBody">
        <p className="clubDesc">{activity.description || ""}</p>

        <div className="clubMeta">
          <span className="pill">{fmt(activity.startsAt)}</span>
          <span className="pill">{fmt(activity.endsAt)}</span>
        </div>
      </div>
    </div>
  );
}
