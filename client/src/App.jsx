import { useState } from "react";
import ClubsPage from "./pages/ClubsPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import "./styles/app.css";

export default function App() {
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState("clubs"); // "clubs" | "activities"

  return (
    <>
      <div style={{ padding: 12, display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btnGhost" onClick={() => setPage("clubs")}>
          Clubs
        </button>
        <button className="btnGhost" onClick={() => setPage("activities")}>
          Activities
        </button>

        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="al">Shqip</option>
          <option value="es">Español</option>
        </select>
      </div>

      {page === "clubs" ? (
        <ClubsPage lang={lang} setLang={setLang} />
      ) : (
        <ActivitiesPage lang={lang} />
      )}
    </>
  );
}
