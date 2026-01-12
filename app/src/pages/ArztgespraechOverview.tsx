import { useNavigate } from "react-router-dom";

export default function ArztgespraechOverview() {
  const navigate = useNavigate();

  const items = [
    { slug: "checkliste", title: "Checkliste für das Arztgespräch" },
    { slug: "diagnose", title: "Fragen zur Diagnose" },
    { slug: "behandlung", title: "Fragen zur Behandlung" },
    { slug: "nebenwirkungen", title: "Fragen zu Nebenwirkungen" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      
      {/* Zurück */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      {/* Titel + Einleitung */}
      <h1 className="text-3xl font-bold text-emerald-900 mb-10">
        Fragen für das Arztgespräch
      </h1>

      {/* Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/entscheidungen/arzt/${item.slug}`)}
            className="rounded-2xl p-8 shadow-sm bg-white hover:shadow-md hover:bg-emerald-50 transition"
          >
            <div className="text-xl font-semibold text-emerald-900 mb-3">
              {item.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
