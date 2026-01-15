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
          <h1 className="mb-8 text-3xl font-extrabold text-emerald-900">
            zusätzliche Therapieoptionen
          </h1>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.slug}
                onClick={() =>
                  navigate(`/informationen/zusaetzlich/${item.slug}`)
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
      </div>
    </div>
  );
}
