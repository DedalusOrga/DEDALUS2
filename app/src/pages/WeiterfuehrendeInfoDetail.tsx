// app/src/pages/WeiterfuehrendeInfoDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ContentModule } from "../types/ContentModule";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";
import { AudioPlayer } from "../components/AudioPlayer";

export default function WeiterfuehrendeInfoDetail() {
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
  } = useContentModulesLazy<ContentModule>({
    type: "text",
    slug,
  });

  // Wie TherapieDetail: nur wenn Binding nichts liefert -> slug-Fallback laden
  useEffect(() => {
    if (!boundLoading && !boundModule && slug) {
      loadModules();
    }
  }, [boundLoading, boundModule, slug, loadModules]);

  const module = (boundModule ?? fallbackModule) as
    | ContentModule
    | null
    | undefined;

  const title =
    module?.title ??
    (slug === "buecher-zeitschriften"
      ? "Bücher/Fachzeitschriften"
      : slug === "internetseiten"
        ? "Internetseiten/Anlaufstellen"
        : slug === "selbsthilfegruppen"
          ? "Selbsthilfegruppen"
          : slug === "wohnortnahe-versorgung"
            ? "Wohnortnahe Versorgung"
            : slug === "krebshilfe-gesellschaft"
              ? "Deutsche Krebshilfe + -gesellschaft"
              : "Weiterführende Informationen");

  const text =
    module?.body_md ??
    "Für diese weiterführenden Informationen sind noch keine Inhalte hinterlegt.";

  const activeAudioUrl = useSimple
    ? (module?.audio_simple_url ?? module?.audio_url ?? null)
    : (module?.audio_url ?? null);

  const loading = boundLoading || fallbackLoading;
  const error = boundError || fallbackError;

  const showMissingState = !loading && !error && !module;

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
            {title}
          </h1>

          <AudioPlayer audioUrl={activeAudioUrl} />

          <div className="flex gap-3"></div>
        </div>

        {loading && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {error && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {showMissingState && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-emerald-950">
            Für diese weiterführenden Informationen sind noch keine Inhalte
            hinterlegt.
          </div>
        )}

        {!showMissingState && !loading && !error && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            <div className="text-sm md:text-base leading-relaxed text-emerald-950">
              <MarkdownWithGlossary text={text} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
