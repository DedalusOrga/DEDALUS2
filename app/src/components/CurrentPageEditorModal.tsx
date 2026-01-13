import { useEffect, useMemo, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";
import { usePageBinding } from "../hooks/usePageBinding";
import { useIsAdmin } from "../hooks/useIsAdmin";

type ContentModuleLite = {
  id: string;
  title: string;
  type: "text" | "pdf" | "video";
  status?: string;
};

function norm(s: string) {
  return (s ?? "").toLowerCase().trim();
}

type Props = {
  open: boolean;
  onClose: () => void;
  pageKey: string;
};

export default function CurrentPageEditorModal({
  open,
  onClose,
  pageKey,
}: Props) {
  const { user } = useIsAdmin();
  const { moduleId: boundModuleId, loading: bindingLoading } =
    usePageBinding(pageKey);

  const [modules, setModules] = useState<ContentModuleLite[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [query, setQuery] = useState("");

  const [saving, setSaving] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiInfo, setUiInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    // Reset UI state on open
    setSelectedModuleId(boundModuleId ?? "");
    setQuery("");
    setUiError(null);
    setUiInfo(null);
  }, [open, boundModuleId]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setModulesLoading(true);

      // Für deine Detailseiten: nur Text-Module anbieten (sonst fehlt evtl. Rendering)
      const { data, error } = await supabase
        .from("content_modules")
        .select("id, title, type, status")
        .eq("type", "text")
        .order("title", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setUiError("Inhalte konnten nicht geladen werden.");
        setModules([]);
      } else {
        setModules((data ?? []) as ContentModuleLite[]);
      }

      setModulesLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedTitle = useMemo(() => {
    if (!selectedModuleId) return "";
    return modules.find((m) => m.id === selectedModuleId)?.title ?? "";
  }, [modules, selectedModuleId]);

  const filteredModules = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return modules.filter((m) => norm(m.title).includes(q)).slice(0, 25); // UI ruhig halten
  }, [modules, query]);

  const showResults = query.trim().length > 0;

  const hasChanges = (boundModuleId ?? "") !== selectedModuleId;

  async function saveBinding() {
    setSaving(true);
    setUiError(null);
    setUiInfo(null);

    try {
      if (!user?.id) {
        setUiError("Du bist nicht eingeloggt.");
        return;
      }
      if (!selectedModuleId) {
        setUiError("Bitte einen Inhalt auswählen.");
        return;
      }

      const { error } = await supabase.from("page_content_bindings").upsert(
        {
          page_key: pageKey,
          module_id: selectedModuleId,
          updated_by: user.id,
        },
        { onConflict: "page_key" },
      );

      if (error) {
        console.error(error);
        setUiError("Speichern nicht möglich.");
        return;
      }

      setUiInfo("Gespeichert.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBinding() {
    setSaving(true);
    setUiError(null);
    setUiInfo(null);

    try {
      const { error } = await supabase
        .from("page_content_bindings")
        .delete()
        .eq("page_key", pageKey);

      if (error) {
        console.error(error);
        setUiError("Entfernen nicht möglich.");
        return;
      }

      setSelectedModuleId("");
      setUiInfo("Zuordnung entfernt.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Inhalt dieser Seite bearbeiten
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Wähle den Text aus, der auf dieser Seite angezeigt werden soll.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {uiError && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {uiError}
            </div>
          )}
          {uiInfo && (
            <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {uiInfo}
            </div>
          )}

          {/* Current selection */}
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold text-slate-600">
              Aktuell ausgewählt
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {bindingLoading ? (
                "Lade…"
              ) : selectedModuleId ? (
                <span className="font-semibold">{selectedTitle || "—"}</span>
              ) : (
                <span className="text-slate-600">Kein Inhalt ausgewählt</span>
              )}
            </div>
          </div>

          {/* Search */}
          <label className="block text-sm font-semibold text-slate-800">
            Suche nach Titel
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. Immuntherapie"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
            disabled={modulesLoading || saving}
          />

          {/* Results table */}
          {showResults && (
            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 flex items-center justify-between">
                <span>Treffer</span>
                <span className="text-xs text-emerald-800">
                  {modulesLoading
                    ? "Lade…"
                    : `${filteredModules.length} angezeigt`}
                </span>
              </div>

              {modulesLoading ? (
                <div className="px-4 py-4 text-sm text-slate-600">
                  Lade Inhalte…
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-600">
                  Keine Treffer. Suchbegriff anpassen.
                </div>
              ) : (
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {filteredModules.map((m) => {
                        const active = selectedModuleId === m.id;
                        return (
                          <tr
                            key={m.id}
                            className={`border-t border-slate-100 cursor-pointer ${
                              active ? "bg-emerald-50" : "hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedModuleId(m.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-slate-900 font-medium">
                                  {m.title}
                                </div>
                                {active && (
                                  <span className="text-xs font-semibold text-emerald-800">
                                    Ausgewählt
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!showResults && (
            <div className="mt-3 text-xs text-slate-500">
              Tipp: Tippe mindestens ein Wort, um passende Inhalte zu sehen.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={removeBinding}
            className="text-sm font-semibold text-red-700 hover:text-red-800 disabled:opacity-50"
            disabled={saving || !boundModuleId}
            title="Zuordnung entfernen"
          >
            Zuordnung entfernen
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              disabled={saving}
            >
              Schließen
            </button>

            <button
              type="button"
              onClick={saveBinding}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={
                saving || modulesLoading || !selectedModuleId || !hasChanges
              }
              title={!hasChanges ? "Keine Änderungen" : "Speichern"}
            >
              {saving ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
