// app/src/pages/ArztgespraechDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ContentModule } from "../../types/ContentModule";
import { useBoundContent } from "../../hooks/useBoundContent";
import { makePageKey } from "../../utils/pageKey";
import { useContentModulesLazy } from "../../hooks/useContentModulesLazy";

import { MarkdownWithGlossary } from "../../glossary/MarkdownWithGlossary";
import { AudioPlayer } from "../../components/AudioPlayer";
import ArztFragenImage from "../../assets/ArztFragen.jpg";

export default function ArztgespraechDetail() {
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
  }, [slug, boundModule, boundLoading, loadModules]);

  const module = (boundModule ?? fallbackModule) as
    | ContentModule
    | null
    | undefined;

  const title =
    module?.title ??
    (slug === "checkliste"
      ? "Checkliste für das Arztgespräch"
      : slug === "diagnose"
        ? "Fragen zur Diagnose"
        : slug === "behandlung"
          ? "Fragen zur Behandlung"
          : slug === "nebenwirkungen"
            ? "Fragen zu Nebenwirkungen"
            : "Fragen für das Arztgespräch");

  const text =
    module?.body_md ??
    "Für diese Fragen zum Arztgespräch sind noch keine Inhalte hinterlegt.";

  const activeAudioUrl = useSimple
    ? (module?.audio_simple_url ?? module?.audio_url ?? null)
    : (module?.audio_url ?? null);

  const loading = boundLoading || fallbackLoading;
  const error = boundError || fallbackError;

  const showMissingState = !loading && !error && !module;

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Zurück */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-900 mb-6 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {/* Header: Titel + Aktionen */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
            {title}
          </h1>

          <AudioPlayer audioUrl={activeAudioUrl} />
        </div>

        <div className="mt-8 mb-3 bg-white rounded-3xl shadow-sm overflow-hidden">
          <img
            src={ArztFragenImage}
            alt="Fragen für das Arztgespräch"
            className="
      w-full
      object-cover
      max-h-64
      md:max-h-72
    "
          />
        </div>

        {loading && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {error && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {showMissingState && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-emerald-950">
            Für diese Fragen zum Arztgespräch sind noch keine Inhalte
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
      <p className="mt-2 text-xs text-center text-emerald-900 opacity-70">
        © Krebsinformationsdienst, Deutsches Krebsforschungszentrum, Fotograf
        Tobias Schwerdt, Wiesenbach
      </p>
    </div>
  );
}
