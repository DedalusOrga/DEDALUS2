// app/src/pages/ZusatzoptionenDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Module } from "../components/ModuleRenderer";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";
import { GlossaryPlain } from "../glossary/GlossaryPlain";

export default function ZusatzoptionenDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [useSimple, setUseSimple] = useState(false);

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
    (slug === "komplementaermedizin"
      ? "Komplementärmedizin (Naturheilkunde)"
      : slug === "ernaehrungsberatung"
        ? "Ernährungsberatung"
        : slug === "entspannung"
          ? "Entspannungs- & Achtsamkeitsverfahren"
          : slug === "schmerztherapie"
            ? "Schmerztherapie"
            : slug === "raucherentwoehnung"
              ? "Raucherentwöhnung"
              : slug === "bewegungstherapie"
                ? "Bewegungstherapie"
                : slug === "physiotherapie"
                  ? "Physiotherapie"
                  : "Zusätzliche Therapieoptionen");

  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diese zusätzlichen Therapieoptionen sind noch keine Inhalte hinterlegt.")
    : (module?.body_md ??
      "Für diese zusätzlichen Therapieoptionen sind noch keine Inhalte hinterlegt.");

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-900 hover:text-emerald-700"
        >
          ← Zurück
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

        <div className="rounded-3xl bg-white p-8 shadow-sm prose prose-emerald max-w-none">
          <GlossaryPlain text={text} />
        </div>
      </div>
    </div>
  );
}
