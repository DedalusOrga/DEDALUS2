import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";
import type { ContentModule } from "../types/ContentModule.ts";
import { AudioPlayer } from "../components/AudioPlayer";
import TextIcon from "../assets/text.svg";

export default function UmgangNebenwirkungenDetail() {
  const slug = "umgang-nebenwirkungen";

  const navigate = useNavigate();
  const [useSimple, setUseSimple] = useState(false);

  // ✅ PageKey im selben Schema wie page_content_bindings
  const pageKey = "informationen:nebenwirkungen:umgang-nebenwirkungen";

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

  const module = (boundModule ?? fallbackModule) as
    | ContentModule
    | null
    | undefined;

  const title = module?.title ?? "Umgang mit Nebenwirkungen";

  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt.")
    : (module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt.");

  // ✅ Neue Audio-Funktion wie in TherapieDetail
  const activeAudioUrl = useSimple
    ? (module?.audio_simple_url ?? module?.audio_url ?? null)
    : (module?.audio_url ?? null);

  const videoUrl = module?.file_url ?? null;
  const hasVideo = !!videoUrl;

  const hasSimpleText = !!module?.body_md_simple;

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

        {/* Header: Titel -> Video -> Aktionen */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
            {title}
          </h1>

          {/* ✅ Video direkt nach dem Titel (über Audio/Buttons, vor Text) */}
          {hasVideo && (
            <div className="mt-4 mb-6 mx-auto w-full max-w-2xl bg-white rounded-3xl shadow-sm p-4 md:p-6">
              <video
                src={videoUrl ?? undefined}
                controls
                preload="metadata"
                className="w-full aspect-video rounded-2xl bg-black"
              />
            </div>
          )}

          {/* ✅ Aktionen unter dem Video: AudioPlayer + Vereinfachen */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AudioPlayer audioUrl={activeAudioUrl} />

            {hasSimpleText && (
              <button
                type="button"
                onClick={() => setUseSimple((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5
                         text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900"
              >
                <img src={TextIcon} alt="" className="w-5 h-5 mr-2" />
                {useSimple ? "Original" : "Vereinfachen"}
              </button>
            )}
          </div>
        </div>

        {(boundLoading || fallbackLoading) && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {(boundError || fallbackError) && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {/* Text */}
        <div
          className="bg-white rounded-3xl shadow-sm p-6 md:p-8
                      text-sm md:text-base leading-relaxed
                      text-emerald-950"
        >
          <MarkdownWithGlossary text={text} />
        </div>
      </div>
    </div>
  );
}
