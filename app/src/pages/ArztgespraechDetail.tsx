import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import type { Module } from "../components/ModuleRenderer";
import { GlossaryMarkdown } from "../glossary/GlossaryMarkdown";

export default function ZusatzoptionenDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [useSimple, setUseSimple] = useState(false);

  const { modules, loading, loadedOnce, loadModules } = useContentModulesLazy({
    type: "text",
    slug,
  });

  useEffect(() => {
    if (slug) {
      loadModules();
    }
  }, [slug, loadModules]);

  const module = modules[0] as Module | undefined;

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
            : "Fragen für das Artzgespräch");

  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diese Fragen zu Artzgespräche sind noch keine Inhalte hinterlegt.")
    : (module?.body_md ??
      "Für diese Fragen zu Artzgespräche sind noch keine Inhalte hinterlegt.");

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        {/* Zurück */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-900 hover:text-emerald-700"
        >
          ← Zurück
        </button>

        {/* Titel */}
        <h1 className="mb-8 text-3xl font-semibold text-emerald-800">
          {title}
        </h1>

        {/* Ladezustand */}
        {loading && !loadedOnce && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {/* Inhalt mit Markdown */}
        <div className="rounded-3xl bg-white p-8 shadow-sm prose prose-emerald max-w-none">
          <GlossaryMarkdown text={text} />
        </div>
      </div>
    </div>
  );
}
