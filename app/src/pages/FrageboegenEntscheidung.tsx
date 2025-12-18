import { useAppNavigate } from "../hooks/useAppNavigate";

export default function FrageboegenEntscheidung() {
  const navigate = useAppNavigate();

  // Aktive Fragebögen
  const frageboegen = [
    {
      id: "fb1",
      title: "Fragebogen 1",
      description: "Was möchte ich mit der Behandlung erreichen?",
      path: "entscheidungen/fragebogen/1",
    },
    {
      id: "fb2",
      title: "Fragebogen 2",
      description: "Wie möchte ich bei Entscheidungen mitwirken?",
      path: "entscheidungen/fragebogen/2",
    },
    {
      id: "fb3",
      title: "Fragebogen 3",
      description: "Was beeinflusst meine Entscheidungen?",
      path: "entscheidungen/fragebogen/3",
    },
    {
      id: "fb4",
      title: "Fragebogen 4",
      description: "Wie werden Entscheidungen bei Krankheiten getroffen?",
      path: "entscheidungen/fragebogen/4",
    },
    {
      id: "fb5",
      title: "Fragebogen 5",
      description: "Was ist mir während der Behandlungsphase wichtig?",
      path: "entscheidungen/fragebogen/5",
    },
  ];

  // Anzahl Platzhalter
  const placeholderCount = 3; // später anpassbar, z. B. 6 oder 9

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* Zurück */}
        <button
          onClick={() => navigate("entscheidungen")}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {/* Beschreibungstext */}
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mb-10">
          Hier finden Sie Fragebögen, die Sie dabei unterstützen,
          Ihre Behandlung und wichtige Entscheidungen besser zu verstehen.
        </h1>

        {/* Karten-Layout */}
        <div className="flex flex-wrap justify-center gap-6">
          {frageboegen.map((fb) => (
            <button
              key={fb.id}
              onClick={() => navigate(`entscheidungen/fragebogen/${fb.id}`)}
              className="bg-white rounded-3xl shadow-sm h-64 w-full sm:w-80 
                         flex flex-col items-center justify-center
                         hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="text-xl font-semibold text-emerald-900 mb-3">
                {fb.title}
              </div>
              <div className="text-emerald-900 text-lg px-6 leading-snug">
                {fb.description}
              </div>
            </button>
          ))}
        </div>

          {/*
          Platzhalter-Karten 
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="bg-white/50 rounded-3xl shadow-inner h-64 flex flex-col 
                         items-center justify-center border border-emerald-200/40"
            >
              <div className="text-lg font-medium text-emerald-700/60 mb-2">
                In Vorbereitung
              </div>
              <div className="text-emerald-700/40 text-sm px-6 text-center">
                Dieser Fragebogen wird zukünftig verfügbar sein.
              </div>
            </div>
          ))}
          */}

      </div>
    </div>
  );
}
