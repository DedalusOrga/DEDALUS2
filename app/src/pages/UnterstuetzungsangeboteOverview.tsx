import { useNavigate } from "react-router-dom";

export default function UnterstuetzungsangeboteOverview() {
  const navigate = useNavigate();

  const items = [
    { slug: "thoraxklinik", title: "Angebote an der Thoraxklinik" },
    { slug: "begleitung", title: "Psych. + seelsorgerische Begleitung" },
    { slug: "sozialdienst", title: "Sozialdienst" },
    { slug: "staatliche-hilfen", title: "Staatliche Hilfen" },
    { slug: "beratungsstellen", title: "Beratungsstellen" },
    {
      slug: "pharmazeutische-dienstleistungen",
      title: "Pharmazeutische Dienstleistungen",
    },
    {
      slug: "pflegeleistungen",
      title: "Pflegeleistungen + ambulante Versorgung",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-emerald-900">
        Unterstützungsangebote
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.slug}
            onClick={() =>
              navigate(`/informationen/unterstuetzung/${item.slug}`)
            }
            className="
              rounded-2xl bg-white p-6 shadow-sm
              hover:bg-emerald-50 hover:shadow-md
              transition text-left
              h-32 flex items-center
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
