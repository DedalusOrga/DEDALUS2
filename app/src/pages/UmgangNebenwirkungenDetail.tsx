import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

import MicrophoneIcon from "../assets/microphone.svg";
import TextIcon from "../assets/text.svg";

export default function UmgangNebenwirkungenDetail() {
  const slug = "umgang-nebenwirkungen";

  const navigate = useNavigate();
  const location = useLocation();

  const [useSimple, setUseSimple] = useState(false);

  // 🔑 pageKey für page_content_bindings
  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname]
  );

  // 1️⃣ Erst: gebundene Inhalte (page_content_bindings)
  const {
    module: boundModule,
    loading: boundLoading,
    error: boundError,
  } = useBoundContent(pageKey);

  // 2️⃣ Fallback: direkt über slug aus content_modules
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
    if (!boundLoading && !boundModule && slug) {
      loadModules();
    }
  }, [boundLoading, boundModule, slug, loadModules]);

  const module = boundModule ?? fallbackModule;

  const title =
  module?.title ?? "Umgang mit Nebenwirkungen";

  const text = useSimple
    ? module?.body_md_simple ??
      module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt."
    : module?.body_md ??
      "Für diesen Inhalt sind noch keine Texte hinterlegt.";

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

      {/* Header: Titel + Aktionen */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Titel */}
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800">
          {title}
        </h1>

        {/* Buttons */}
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

      {/* Ladezustand */}
      {(boundLoading || fallbackLoading) && (
        <div className="mb-4 text-emerald-900">
          Inhalt wird geladen …
        </div>
      )}

      {/* Fehler */}
      {(boundError || fallbackError) && (
        <div className="mb-4 text-red-700">
          Fehler beim Laden der Inhalte
        </div>
      )}

      {/* Text */}
      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8
                      text-sm md:text-base leading-relaxed
                      text-emerald-950 whitespace-pre-line">
        {text}
      </div>

    </div>
  </div>
)};
