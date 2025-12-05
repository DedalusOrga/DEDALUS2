import { useNavigate } from "react-router-dom";

export default function EntscheidungenOverview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* Zurück */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>


        {/* Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Karte 1 */}
          <button
            onClick={() => navigate("/entscheidungen/arztgespraech")}
            className="bg-white rounded-3xl shadow-sm h-56 flex flex-col items-center justify-center
                       hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-lg font-medium text-emerald-900 text-center">
              Fragen für das Arztgespräch
            </div>
          </button>

          {/* Karte 2 */}
          <button
            onClick={() => navigate("/entscheidungen/planung")}
            className="bg-white rounded-3xl shadow-sm h-56 flex flex-col items-center justify-center
                       hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-lg font-medium text-emerald-900 text-center">
              Planung und Entscheidung
            </div>
          </button>

          {/* Karte 3 */}
          <button
            onClick={() => navigate("/entscheidungen/frageboegen-entscheidung")}
            className="bg-white rounded-3xl shadow-sm h-56 flex flex-col items-center justify-center
                       hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-lg font-medium text-emerald-900 text-center">
              Fragebögen zu Entscheidung
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
