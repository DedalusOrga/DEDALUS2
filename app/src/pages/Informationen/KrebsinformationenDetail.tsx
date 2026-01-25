import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContentModulesLazy } from "../../hooks/useContentModulesLazy";
import { useBoundContent } from "../../hooks/useBoundContent";
import { makePageKey } from "../../utils/pageKey";
import type { Module } from "../../components/admin/ModuleRenderer";
import { MarkdownWithGlossary } from "../../glossary/MarkdownWithGlossary";

export default function KrebsinformationenDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [useSimple, setUseSimple] = useState(false);

  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname],
  );

  const {
    module: boundModule,
    loading: boundLoading,
    error: boundError,
  } = useBoundContent(pageKey);

  const {
    module: fallbackModule,
    loading: fallbackLoading,
    error: fallbackError,
    loadModules,
  } = useContentModulesLazy({
    type: "text",
    slug,
  });

  useEffect(() => {
    if (!boundLoading && !boundModule && slug) loadModules();
  }, [boundLoading, boundModule, slug, loadModules]);

  const module = (boundModule ?? fallbackModule) as Module | null | undefined;

  const title =
    module?.title ??
    (slug === "stadienuebersicht"
      ? "Stadienübersicht + Erklärung"
      : slug === "stadium-vergleich"
        ? "Stadium III vs. IV"
        : "Allgemeine Krebsinformationen");

  const text =
    module?.body_md ??
    "Für diese Krebsinformationen sind noch keine Inhalte hinterlegt.";

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-emerald-800">{title}</h1>

          <button
            type="button"
            onClick={() => setUseSimple((p) => !p)}
            className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-900"
          >
            {useSimple ? "Original" : "Vereinfachen"}
          </button>
        </div>

        {(boundLoading || fallbackLoading) && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}
        {(boundError || fallbackError) && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-sm md:text-base leading-relaxed text-emerald-950 whitespace-pre-line">
          <MarkdownWithGlossary text={text} />
        </div>
      </div>
    </div>
  );
}
