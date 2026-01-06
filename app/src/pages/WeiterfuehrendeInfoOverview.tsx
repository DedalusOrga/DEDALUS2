import { useNavigate } from "react-router-dom";

export default function WeiterfuehrendeInfoOverview() {
  const navigate = useNavigate();

  const items = [
    { slug: "buecher-zeitschriften", title: "Bücher/Fachzeitschriften", },
    {
      slug: "internetseiten",
      title: "Internetseiten/Anlaufstellen",
    },
    { slug: "selbsthilfegruppen", title: "Selbsthilfegruppen" },
    { slug: "wohnortnahe-versorgung", title: "Wohnortnahe Versorgung" },
    {
      slug: "krebshilfe-gesellschaft",
      title: "Deutsche Krebshilfe + -gesellschaft",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-emerald-900">
        Weiterführende Informationen
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/informationen/weiter/${item.slug}`)}
            className="
              rounded-2xl bg-white p-6 shadow-sm
              hover:bg-emerald-50 hover:shadow-md transition
              text-left h-32 flex items-center
              text-lg font-semibold text-slate-900
            "
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
