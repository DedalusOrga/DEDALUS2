// app/src/pages/TherapieDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ContentModule } from "../types/ContentModule";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import MicrophoneIcon from "../assets/microphone.svg";
import TextIcon from "../assets/text.svg";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";

export default function TherapieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [useSimple, setUseSimple] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();
  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname]
  );

  const {
    module: boundModule,
    loading: boundLoading,
    error: boundError,
  } = useBoundContent(pageKey);

  const {
    modules,
    module: fallbackModule,
    loading: fallbackLoading,
    loadedOnce: fallbackLoadedOnce,
    error: fallbackError,
    loadModules,
  } = useContentModulesLazy<ContentModule>({
    type: "text",
    slug,
  });

  useEffect(() => {
    if (!boundLoading && !boundModule && slug) {
      loadModules();
    }
  }, [slug, boundModule, boundLoading, loadModules]);

  const module = boundModule ?? fallbackModule;

  // Fallback-Titel auf Basis des Slugs, falls in der DB noch nichts steht
  const title =
    module?.title ??
    (slug === "strahlentherapie"
      ? "Strahlentherapie"
      : slug === "chemotherapie"
        ? "Chemotherapie"
        : slug === "operationen"
          ? "Operationen"
          : slug === "immuntherapie"
            ? "Immuntherapie"
            : slug === "zielgerichtete-therapie"
              ? "Zielgerichtete Therapie"
              : slug === "palliativmedizin"
                ? "Palliativmedizin"
                : "Therapie");

  // Text aus body_md, sonst Fallback
  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diese Therapie sind noch keine Inhalte hinterlegt.")
    : (module?.body_md ??
      "Für diese Therapie sind noch keine Inhalte hinterlegt.");

  // Video-URL aus data.video_url
  const videoUrl = module?.data?.video_url;
  const hasVideo = !!videoUrl;

  const { isSpeaking, toggleSpeak } = useTextToSpeech(text, {
    lang: "de-DE",
    rate: 1.0,
  });

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

        {/* Header: Titel + Aktionen (wie NebenwirkungenDetail) */}
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

            <button
              type="button"
              onClick={() => setUseSimple((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5
                         text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900"
            >
              <img src={TextIcon} alt="" className="w-5 h-5 mr-2" />
              {useSimple ? "Original" : "Vereinfachen"}
            </button>
          </div>
        </div>

        {(boundLoading || fallbackLoading) && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {(boundError || fallbackError) && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {/* Content */}
        <div
          className={
            "bg-white rounded-3xl shadow-sm p-6 md:p-8 grid gap-8 " +
            (hasVideo ? "md:grid-cols-2" : "md:grid-cols-1")
          }
        >
          <div className="text-sm md:text-base leading-relaxed text-emerald-950 whitespace-pre-line">
            {text}
          </div>

          {hasVideo && (
            <div className="flex items-center justify-center">
              <video src={videoUrl} controls className="w-full rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
