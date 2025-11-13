import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Therapy = {
  id: string;
  name: string;
  icon: string;
  slug: string;
};

const page1: Therapy[] = [
  { id: "strahlen", name: "Strahlentherapie", icon: "☀️", slug: "strahlentherapie" },
  { id: "chemo", name: "Chemotherapie", icon: "💉", slug: "chemotherapie" },
  { id: "op", name: "Operationen", icon: "🛏️", slug: "operationen" },
];

const page2: Therapy[] = [
  { id: "immun", name: "Immuntherapie", icon: "🛡️", slug: "immuntherapie" },
  {
    id: "target",
    name: "zielgerichtete Therapie",
    icon: "🎯",
    slug: "zielgerichtete-therapie",
  },
  { id: "palliativ", name: "Palliativmedizin", icon: "🍃", slug: "palliativmedizin" },
];

export default function InformationenOverview() {
  const [page, setPage] = useState<0 | 1>(0); // 0 = erste 3, 1 = zweite 3
  const navigate = useNavigate();

  const therapies = page === 0 ? page1 : page2;

  const handleCardClick = (slug: string) => {
    navigate(`/informationen/${slug}`);
  };

  const togglePage = () => {
    setPage((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Zurück oben */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {/* Titel */}
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mb-10">
          Hier finden Sie verständliche Informationen zu verschiedenen Therapien.
        </h1>

        {/* Karten – immer nur 3 pro “Seite” */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {therapies.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.slug)}
              className="bg-white rounded-3xl shadow-sm h-48 flex flex-col items-center justify-center 
                         hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className="text-lg font-medium text-emerald-900 text-center">
                {card.name}
              </div>
            </button>
          ))}
        </div>

        {/* Pfeil links/rechts + Videos-Button */}
        <div className="flex items-center justify-between mt-4">
          {/* Pfeil links (nur auf Seite 2) */}
          {page === 1 && (
            <button
              onClick={togglePage}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-emerald-800 
                         text-2xl text-emerald-900 hover:bg-emerald-100 transition"
              aria-label="Zu vorherigen Therapien zurückkehren"
            >
              ← 
            </button>
          )}

          <div className="flex-1" />

          {/* Videos Button */}
          <button
            onClick={() => navigate("/videos")} // Route musst du noch anlegen
            className="flex items-center bg-emerald-800 hover:bg-emerald-900 text-white 
                       font-semibold px-6 py-3 rounded-full text-base shadow-md"
          >
            Zu den Videos <span className="ml-2 text-xl">→</span>
          </button>

          {/* Pfeil rechts (nur auf Seite 1) */}
          {page === 0 && (
            <button
              onClick={togglePage}
              className="ml-4 flex items-center justify-center w-12 h-12 rounded-full border border-emerald-800 
                         text-2xl text-emerald-900 hover:bg-emerald-100 transition"
              aria-label="Weitere Therapien anzeigen"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
