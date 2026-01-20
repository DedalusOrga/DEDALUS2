import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";

export default function PatientenNeueInhalteDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname],
  );

  const { module, loading, error } = useBoundContent(pageKey);

  const title = module?.title ?? "Neue Videos / Inhalte";
  const text =
    module?.body_md ??
    "Noch keine Inhalte hinterlegt. (Admin: bitte ein Content-Modul an diese Seite binden.)";

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-900 hover:text-emerald-700"
        >
          ← Zurück
        </button>

        <h1 className="mb-6 text-3xl font-semibold text-emerald-800">
          {title}
        </h1>

        {loading && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}
        {error && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        <div className="rounded-3xl bg-white p-8 shadow-sm text-emerald-950 whitespace-pre-line">
          <MarkdownWithGlossary text={text} />
        </div>
      </div>
    </div>
  );
}
