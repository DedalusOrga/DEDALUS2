import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";
import type { ContentModule } from "../types/ContentModule.ts";
import { makePageKey } from "../utils/pageKey";

import MicrophoneIcon from "../assets/microphone.svg";

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

  const videoUrl = module?.file_url;
  const hasVideo = !!videoUrl;

  const { isSpeaking, toggleSpeak } = useTextToSpeech(text, {
    lang: "de-DE",
    rate: 1.0,
  });

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

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
            {title}
          </h1>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleSpeak}
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5
                       text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900"
            >
              <img src={MicrophoneIcon} alt="" className="w-5 h-5 mr-2" />
              {isSpeaking ? "Stopp" : "Vorlesen"}
            </button>

            {/* Optional: wenn du wirklich vereinfachen willst, brauchst du auch einen Button dafür */}
            {/* <button ... onClick={() => setUseSimple((p) => !p)}>...</button> */}
          </div>
        </div>

        {(boundLoading || fallbackLoading) && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {(boundError || fallbackError) && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        <div
          className={
            "bg-white rounded-3xl shadow-sm p-6 md:p-8 grid gap-8 " +
            (hasVideo ? "md:grid-cols-2" : "md:grid-cols-1")
          }
        >
          {/* Textbereich */}
          <div className="text-sm md:text-base leading-relaxed text-emerald-950">
            <MarkdownWithGlossary text={text} />
          </div>

          {hasVideo && (
            <div className="flex items-center justify-center">
              <video
                src={videoUrl ?? undefined}
                controls
                className="w-full rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
