import { useParams, useNavigate } from "react-router-dom";

export default function ZusatzoptionenDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const titleMap: Record<string, string> = {
    komplementaermedizin: "Komplementärmedizin",
    ernaehrungsberatung: "Ernährungsberatung",
    entspannung: "Entspannungs- & Achtsamkeitsverfahren",
    schmerztherapie: "Schmerztherapie",
    bewegungstherapie: "Bewegungstherapie",
    physiotherapie: "Physiotherapie",
  };

  const title = titleMap[slug ?? ""] ?? "Zusätzliche Therapieoptionen";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-emerald-900 hover:text-emerald-700"
      >
        ← Zurück
      </button>

      <h1 className="mb-6 text-3xl font-bold text-emerald-900">{title}</h1>

      <div className="rounded-2xl bg-white p-8 shadow-sm leading-relaxed">
        Lorem ipsum – hier kommen später die Inhalte für{" "}
        <strong>{title}</strong>.
      </div>
    </div>
  );
}
