import { useParams, useNavigate } from "react-router-dom";

export default function UnterstuetzungsangeboteDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ---------------------------------------------------
  // 📌 Titel-Mapping exakt basierend auf deinen Slugs
  // ---------------------------------------------------
  const titleMap: Record<string, string> = {
    thoraxklinik: "Angebote an der Thoraxklinik",
    begleitung: "Psych. + seelsorgerische Begleitung",
    sozialdienst: "Sozialdienst",
    "staatliche-hilfen": "staatliche Hilfen",
    beratungsstellen: "Beratungsstellen",
    "pharmazeutische-dienstleistungen": "Pharmazeutische Dienstleistungen",
    pflegeleistungen: "Pflegeleistungen + ambulante Versorgung",
  };

  const title = titleMap[slug ?? ""] ?? "Unterstützungsangebote";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Zurück-Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-emerald-900 hover:text-emerald-700"
      >
        ← Zurück
      </button>

      {/* Titel */}
      <h1 className="mb-6 text-3xl font-bold text-emerald-900">{title}</h1>

      {/* Inhalt */}
      <div className="rounded-2xl bg-white p-8 shadow-sm leading-relaxed">
        Lorem ipsum – hier kommen später die Inhalte für{" "}
        <strong>{title}</strong>.
      </div>
    </div>
  );
}
