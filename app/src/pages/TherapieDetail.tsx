// app/src/pages/TherapieDetail.tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";

export default function TherapieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { modules, loading, loadedOnce, loadModules } = useContentModulesLazy({
    type: "text",
    slug,
  });

  useEffect(() => {
    if (slug) {
      loadModules();
    }
  }, [slug, loadModules]);

  const module = modules[0];

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
  const text =
    module?.body_md ??
    "Für diese Therapie sind noch keine Inhalte hinterlegt.";

  // Video-URL aus data.video_url
  const videoUrl = module?.data?.video_url ?? null;
  const hasVideo = !!videoUrl;

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Zurück */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {/* Titel */}
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800 mb-8">
          {title}
        </h1>

        {/* Ladezustand */}
        {loading && !loadedOnce && (
          <div className="mb-4 text-emerald-900">
            Inhalt wird geladen …
          </div>
        )}

        {/* Weißer Content-Block: Text + optional Video */}
        <div
          className={
            "bg-white rounded-3xl shadow-sm p-6 md:p-8 grid gap-8 " +
            (hasVideo ? "md:grid-cols-2" : "md:grid-cols-1")
          }
        >
          {/* Textbereich */}
          <div className="text-sm md:text-base leading-relaxed text-emerald-950 whitespace-pre-line">
            {text}
          </div>

          {/* Videobereich – nur, wenn wirklich ein Video hinterlegt ist */}
          {hasVideo && (
            <div className="flex items-center justify-center">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Buttons unten */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 
                       text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="mr-2 text-lg">🎤</span>
            Vorlesen
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 
                       text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="mr-2 text-lg">☰</span>
            Vereinfachen
          </button>
        </div>
      </div>
    </div>
  );
}
