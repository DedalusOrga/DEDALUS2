import { useNavigate } from "react-router-dom";

export default function ZusatzoptionenOverview() {
  const navigate = useNavigate();

  const items = [
    {
      slug: "komplementaermedizin",
      title: "Komplementärmedizin (Naturheilkunde)",
    },
    { slug: "ernaehrungsberatung", title: "Ernährungsberatung" },
    { slug: "entspannung", title: "Entspannungs- u. Achtsamkeitsverfahren" },
    { slug: "schmerztherapie", title: "Schmerztherapie" },
    { slug: "raucherentwoehnung", title: "Raucherentwöhnung" },
    { slug: "bewegungstherapie", title: "Bewegungstherapie" },
    { slug: "pphysiotherapie", title: "Physiotherapie" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-emerald-900">
        zusätzliche Therapieoptionen
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/informationen/zusaetzlich/${item.slug}`)}
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
