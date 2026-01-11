import { useNavigate } from "react-router-dom";

export default function PatientenPerspektiveOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "pp-sideeffects-1",
      title: "Patientenperspektive I zu Nebenwirkungen",
      slug: "videos-audios",
    },
    {
      id: "neu",
      title: "Platzhalter für neue Videos/Inhalte",
      slug: "neue-inhalte",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-10 text-3xl font-extrabold text-emerald-900">
        Patient*innen-perspektive
      </h1>

      <div className="grid gap-8 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() =>
              navigate(`/informationen/patientenperspektive/${card.slug}`)
            }
            className="flex h-full w-full flex-col items-start rounded-2xl bg-white p-8 text-left
                       shadow-sm transition hover:bg-emerald-50 hover:shadow-md focus:outline-none
                       focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <span className="text-lg font-semibold text-slate-900">
              {card.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
