import { useEffect, useState } from "react";
import { getClubs } from "../api/clubsApi";
import ClubCard from "../components/ClubCard";
import JoinModal from "../components/JoinModal";
import ProfileDrawer from "../components/ProfileDrawer";
import { readSession } from "../storage/session";
import { t } from "../i18n";

export default function ClubsPage({ lang, setLang }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [joinOpen, setJoinOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const json = await getClubs(lang);
      setClubs(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [lang]);

  const session = readSession();

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brand">
          <div className="logoDot" />
          <div>
            <div className="brandName">{t(lang, "appName")}</div>
            <div className="brandSub">{t(lang, "clubs")} • Membership • Activities</div>
          </div>
        </div>

        <div className="topbarRight">
          <div className="langWrap">
            <span className="muted">{t(lang, "language")}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="al">Shqip</option>
              <option value="es">Español</option>
            </select>
          </div>

          <button className="iconBtn" onClick={() => setProfileOpen(true)} title="Profile">
            {session ? "👤" : "🙂"}
          </button>
        </div>
      </header>

      <main className="content">
        <div className="pageHeader">
          <div>
            <h1>{t(lang, "clubs")}</h1>
            <p className="muted">
              Choose a club and join with a membership plan. Your profile will store membership deadline.
            </p>
          </div>
          <button className="btnGhost" onClick={load}>Refresh</button>
        </div>

        {error ? <div className="alertErr">{error}</div> : null}
        {toast ? <div className="alertOk">{toast}</div> : null}

        {loading ? <p>{t(lang, "loading")}</p> : null}

        <div className="grid">
          {clubs.length === 0 ? (
            <div className="empty">{t(lang, "noClubs")}</div>
          ) : (
            clubs.map((club) => (
              <ClubCard
                key={club._id}
                club={club}
                lang={lang}
                onJoin={(c) => {
                  setSelectedClub(c);
                  setJoinOpen(true);
                }}
              />
            ))
          )}
        </div>
      </main>

      <footer className="footer">© 2026 ClubApp • React + Node</footer>

      <JoinModal
        open={joinOpen}
        club={selectedClub}
        lang={lang}
        onClose={() => setJoinOpen(false)}
        onJoined={() => {
          setToast(t(lang, "joined"));
          setTimeout(() => setToast(""), 2500);
        }}
      />

      <ProfileDrawer
        open={profileOpen}
        lang={lang}
        onClose={() => setProfileOpen(false)}
        onLogout={() => {
          setToast("Logged out.");
          setTimeout(() => setToast(""), 2000);
        }}
      />
    </div>
  );
}
