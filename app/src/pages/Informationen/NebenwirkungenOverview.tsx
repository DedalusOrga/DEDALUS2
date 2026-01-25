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
    <div className="min-h-screen w-full bg-emerald-50 overflow-x-hidden">
      <div
        className="
          mx-auto w-full max-w-screen-xl
          px-4 sm:px-6 lg:px-8
          pt-6 sm:pt-8 lg:pt-10
          pb-10
          [padding-bottom:calc(2.5rem+env(safe-area-inset-bottom))]
        "
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-2 rounded-xl
            px-2 py-2 text-emerald-950 hover:text-emerald-800
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
          "
          aria-label="Zurück"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-base font-medium">Zurück</span>
        </button>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-extrabold text-emerald-900 mb-10">
            Nebenwirkungsmanagement
          </h1>

          <div className="grid gap-8 sm:grid-cols-2">
            {cards.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  navigate(`/informationen/nebenwirkungen/${c.slug}`)
                }
                className="rounded-2xl p-8 shadow-sm bg-white hover:shadow-md hover:bg-emerald-50 transition"
              >
                <div className="text-lg font-semibold text-slate-900">
                  {c.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
