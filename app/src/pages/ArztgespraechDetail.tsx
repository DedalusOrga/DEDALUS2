import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ContentModule } from "../types/ContentModule";
import { useBoundContent } from "../hooks/useBoundContent";
import { makePageKey } from "../utils/pageKey";
import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";

// ✅ Admin
import CurrentPageEditorModal from "../components/CurrentPageEditorModal";
import { useCurrentPageEditEligibility } from "../hooks/useCurrentPageEditEligibility";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function ArztgespraechDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [useSimple, setUseSimple] = useState(false);

  // ✅ Admin Modal
  const [editOpen, setEditOpen] = useState(false);

  // Wichtig: Seite ist binding-gesteuert (kein slug-fallback!)
  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname]
  );

  const {
    module: boundModule,
    loading: boundLoading,
    error: boundError,
  } = useBoundContent(pageKey);

  const module = boundModule as ContentModule | null | undefined;

  // Admin eligibility (Button anzeigen nur wenn erlaubt)
  const { canEditCurrentPage } = useCurrentPageEditEligibility();
  const { user } = useIsAdmin();
  const isAdmin = !!user;

  // Fallback-Titel auf Basis des Slugs, falls in der DB noch kein Titel steht
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

  // Text aus body_md/body_md_simple, sonst Fallback
  const text = useSimple
    ? (module?.body_md_simple ??
      module?.body_md ??
      "Für diese Fragen zum Arztgespräch sind noch keine Inhalte hinterlegt.")
    : (module?.body_md ??
      "Für diese Fragen zum Arztgespräch sind noch keine Inhalte hinterlegt.");

  // ✅ Kein Binding => keine Inhalte anzeigen (nicht über slug nachladen!)
  const showMissingState = !boundLoading && !boundError && !module;

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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUseSimple((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5
                         text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900"
            >
              {useSimple ? "Original" : "Vereinfachen"}
            </button>
          </div>
        </div>

        {boundLoading && (
          <div className="mb-4 text-emerald-900">Inhalt wird geladen …</div>
        )}

        {boundError && (
          <div className="mb-4 text-red-700">Fehler beim Laden der Inhalte</div>
        )}

        {showMissingState && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-emerald-950">
            Für diese Fragen zum Arztgespräch sind noch keine Inhalte
            hinterlegt.
          </div>
        )}

        {!showMissingState && !boundLoading && !boundError && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            <div className="text-sm md:text-base leading-relaxed text-emerald-950">
              <MarkdownWithGlossary text={text} />
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal */}
      {isAdmin && (
        <CurrentPageEditorModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          pageKey={pageKey}
        />
      )}
    </div>
  );
}
