import { t } from "../i18n";

export default function ClubCard({ club, lang, onJoin }) {
  return (
    <div className="clubCard">
      <div className="clubTop">
        <div>
          <div className="clubName">{club.name}</div>
          <div className="clubMeta">
            <span className="pill">{t(lang, "type")}: {club.type || "-"}</span>
            <span className={`pill ${club.status === "active" ? "pillOk" : "pillOff"}`}>
              {t(lang, "status")}: {club.status || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="clubBody">
        <p className="clubDesc">
          {club.type === "fitness" && "Gym, training programs, and classes."}
          {club.type === "dance" && "Dance classes, choreography, and events."}
          {club.type === "coding" && "Workshops, projects, and coding sessions."}
          {!["fitness", "dance", "coding"].includes(club.type) && "Club activities and schedules."}
        </p>

        <button className="btnPrimary" onClick={() => onJoin(club)}>
          {t(lang, "join")}
        </button>
      </div>
    </div>
  );
}
