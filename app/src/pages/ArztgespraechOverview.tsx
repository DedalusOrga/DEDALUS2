import { useNavigate } from "react-router-dom";
import { useAppNavigate } from "../hooks/useAppNavigate";

export default function ArztgespraechOverview() {
  const navigate = useAppNavigate();
  const routerNavigate = useNavigate();

  const arztgespraech = [
    { id: "checkliste", title: "Checkliste für das Arztgespräch" },
    { id: "diagnose", title: "Fragen zur Diagnose" },
    { id: "behandlung", title: "Fragen zur Behandlung" },
    { id: "nebenwirkungen", title: "Fragen zu Nebenwirkungen" },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      
      {/* Zurück */}
      <button
        onClick={() => routerNavigate(-1)}
        className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      {/* Titel + Einleitung */}
      <h1 className="text-3xl font-semibold text-emerald-900 mb-4">
        Fragen für das Arztgespräch
      </h1>

      <p className="text-emerald-800 mb-10 max-w-3xl">
        Hier finden Sie verschiedene Bereiche mit Beispiel-Fragen, die Sie bei
        Ihrem Arztgespräch unterstützen können. Wählen Sie einen Bereich aus,
        um die dazugehörigen Fragen zu sehen.
      </p>

      {/* Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {arztgespraech.map((ag) => (
          <button
            key={ag.id}
            onClick={() => navigate(`/arztgespraech/${ag.id}`)}
            className="bg-white rounded-3xl shadow-sm h-64 w-full sm:w-60 
                       flex flex-col items-center justify-center
                       hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            <div className="text-xl font-semibold text-emerald-900 mb-3">
              {ag.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
