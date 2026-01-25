import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";
import type { ContentModule } from "../types/ContentModule.ts";
import { makePageKey } from "../utils/pageKey";
import { AudioPlayer } from "../components/AudioPlayer";

export default function PatientenVideosDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const [useSimple, setUseSimple] = useState(false);

  // ✅ PageKey dynamisch und kompatibel zu deinem Binding-System
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
    slug: slug ?? "",
  });

  useEffect(() => {
    if (!slug) return;
    if (!boundLoading && !boundModule) loadModules();
  }, [boundLoading, boundModule, slug, loadModules]);

  const module = (boundModule ?? fallbackModule) as
    | ContentModule
    | null
    | undefined;

  const title = module?.title ?? "Patientenperspektive I zu Nebenwirkungen";

  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt.")
    : (module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt.");

  // ✅ Audio wie in TherapieDetail: je nach Vereinfachung andere Audio-Quelle
  const activeAudioUrl = useSimple
    ? (module?.audio_simple_url ?? module?.audio_url ?? null)
    : (module?.audio_url ?? null);

  const videoUrl = module?.file_url ?? null;
  const hasVideo = !!videoUrl;

  // ✅ Sauberer Fehler, falls jemand die Route ohne slug aufruft
  if (!slug) {
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

          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            Ungültige URL: Es fehlt der Slug.
          </div>
        </div>
      </div>
    );
  }

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

        {/* Header: Titel -> Video -> Buttons */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
            {title}
          </h1>

          {/* Video direkt nach dem Titel, über den Buttons, vor dem Text */}
          {hasVideo && (
            <div className="mt-4 flex items-center justify-center">
              <video
                src={videoUrl ?? undefined}
                controls
                className="w-full max-w-4xl rounded-xl"
              />
            </div>
          )}

          {/* ✅ Buttons (Vorlesen jetzt wie in TherapieDetail über AudioPlayer) */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AudioPlayer audioUrl={activeAudioUrl} />

            {/* Optional: Vereinfachen-Button – aktuell nicht aktiv.
                Wenn du ihn brauchst, sag kurz Bescheid, dann setze ich ihn passend mit hasSimpleText-Logik ein. */}
            {/* <button ... onClick={() => setUseSimple((p) => !p)}>...</button> */}
          </div>
        </div>

        {(boundLoading || fallbackLoading) && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {(boundError || fallbackError) && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {/* Textbereich */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
          <div className="text-sm md:text-base leading-relaxed text-emerald-950">
            <MarkdownWithGlossary text={text} />
          </div>
        </div>
      </div>
    </div>
  );
}
