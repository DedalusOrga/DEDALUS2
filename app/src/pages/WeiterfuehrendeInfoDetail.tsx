import { useParams, useNavigate } from "react-router-dom";
import { useAppNavigate } from "../hooks/useAppNavigate";

export default function WeiterfuehrendeInfoDetail() {
  const { slug } = useParams();
  const navigate = useAppNavigate();
  const routerNavigate = useNavigate();

const titleMap: Record<string, string> = {
  "buecher-zeitschriften": "Bücher/Fachzeitschriften",
  internetseiten: "Internetseiten/Anlaufstellen",
  selbsthilfegruppen: "Selbsthilfegruppen",
  "wohnortnahe-versorgung": "Wohnortnahe Versorgung",
  "deutsche-krebshilfe": "Deutsche Krebshilfe + -gesellschaft",
};


  const title = titleMap[slug ?? ""] ?? "Weiterführende Informationen";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={() => routerNavigate(-1)}
        className="mb-6 text-emerald-900 hover:text-emerald-700"
      >
        ← Zurück
      </button>

      <h1 className="mb-6 text-3xl font-bold text-emerald-900">{title}</h1>

      <div className="rounded-2xl bg-white p-8 shadow-sm leading-relaxed">
        Lorem ipsum – hier kommen später Inhalte für{" "}
        <strong>{title}</strong>.
      </div>
    </div>
  );
}
