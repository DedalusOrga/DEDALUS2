import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";

export default function PlanungDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [useSimple, setUseSimple] = useState(false);

  const { modules, loading, loadedOnce, loadModules } =
    useContentModulesLazy({
      type: "text",
      slug,
    });

  useEffect(() => {
    if (slug) {
      loadModules();
    }
  }, [slug, loadModules]);

  const module = modules[0];

  const title =
  module?.title ??
  (slug === "entscheidungsfindung"
    ? "Infos zur Entscheidungsfindung"
    : slug === "lebensplanung"
    ? "Planung für das Lebensende"
    : "Planung und Entscheidung");

  const text = useSimple
    ? module?.body_md_simple ??
      module?.body_md ??
      "Für diese Planung und Entscheidung sind noch keine Inhalte hinterlegt."
    : module?.body_md ??
      "Für diese Planung und Entscheidung sind noch keine Inhalte hinterlegt.";

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        {/* Zurück */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-900 hover:text-emerald-700"
        >
          ← Zurück
        </button>

        {/* Titel */}
        <h1 className="mb-8 text-3xl font-semibold text-emerald-800">
          {title}
        </h1>

        {/* Ladezustand */}
        {loading && !loadedOnce && (
          <div className="mb-4 text-emerald-900">
            Inhalt wird geladen …
          </div>
        )}

        {/* Text */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-emerald-950 text-base leading-relaxed whitespace-pre-line">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

