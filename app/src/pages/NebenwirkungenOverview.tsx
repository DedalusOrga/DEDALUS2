import { useNavigate } from "react-router-dom";

export default function NebenwirkungenOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "nw",
      title: "Nebenwirkungen",
      slug: "nebenwirkungen-detail",
    },
    {
      id: "umgang",
      title: "Umgang mit Nebenwirkungen",
      slug: "umgang-nebenwirkungen",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-emerald-900 mb-10">
        Nebenwirkungsmanagement
      </h1>

      <div className="grid gap-8 sm:grid-cols-2">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/informationen/nebenwirkungen/${c.slug}`)}
            className="rounded-2xl p-8 shadow-sm bg-white hover:shadow-md hover:bg-emerald-50 transition"
          >
            <div className="text-lg font-semibold text-slate-900">
              {c.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
