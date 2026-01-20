import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../infrastructure/supabase/client";

type GlossaryRow = {
  id: string;
  term: string | null;
  definition: string | null;
  term_normalized?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function normalizeQuery(q: string) {
  return q.trim();
}

export default function AdminGlossary() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<GlossaryRow[]>([]);

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null); // "NEW" | id | null
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const q = useMemo(() => normalizeQuery(query), [query]);

  async function loadGlossary() {
    setLoading(true);
    setError(null);

    let req = supabase
      .from("glossary_terms")
      .select("id,term,definition,term_normalized,created_at,updated_at")
      .order("term", { ascending: true })
      .limit(200);

    // Suche ab 2 Zeichen (term + term_normalized + definition)
    if (q.length >= 2) {
      req = req.or(
        `term.ilike.%${q}%,term_normalized.ilike.%${q}%,definition.ilike.%${q}%`,
      );
    }

    const { data, error } = await req;

    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as GlossaryRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadGlossary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-Suche (kleiner Delay)
  useEffect(() => {
    const t = setTimeout(() => {
      loadGlossary();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function resetEditor() {
    setEditingId(null);
    setTerm("");
    setDefinition("");
  }

  function startCreate() {
    resetEditor();
    setEditingId("NEW");
  }

  function startEdit(row: GlossaryRow) {
    setEditingId(row.id);
    setTerm(row.term ?? "");
    setDefinition(row.definition ?? "");
  }

  async function save() {
    const t = term.trim();
    const d = definition.trim();

    if (!t) {
      setError("Bitte einen Begriff (term) eingeben.");
      return;
    }
    if (!d) {
      setError("Bitte eine Definition eingeben.");
      return;
    }

    setSaving(true);
    setError(null);

    if (editingId === "NEW") {
      const { error } = await supabase.from("glossary_terms").insert({
        term: t,
        definition: d,
        // term_normalized hat bei euch default expression -> muss man nicht setzen
      });

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else if (editingId) {
      const { error } = await supabase
        .from("glossary_terms")
        .update({
          term: t,
          definition: d,
          // falls ihr updated_at nicht per Trigger setzt:
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetEditor();
    await loadGlossary();
  }

  async function remove(row: GlossaryRow) {
    const ok = window.confirm(
      `Eintrag wirklich löschen?\n\n${row.term ?? "(ohne Begriff)"}`,
    );
    if (!ok) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("glossary_terms")
      .delete()
      .eq("id", row.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    if (editingId === row.id) resetEditor();
    await loadGlossary();
  }

  return (
    <AdminLayout title="Glossar verwalten">
      {(loading || saving) && (
        <div className="mb-4 text-emerald-900">
          {loading ? "Lade…" : "Speichere…"}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          Fehler: {error}
        </div>
      )}

      {/* Search + Create */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex-1">
            <label className="text-emerald-900 font-semibold block mb-2">
              Suche
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Begriff oder Definition (mind. 2 Zeichen)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
            <div className="mt-2 text-xs text-slate-500">
              {q.length < 2
                ? `Zeige aktuell bis zu ${rows.length} Einträge (ohne Filter)`
                : `${rows.length} Treffer`}
            </div>
          </div>

          <div className="md:self-end">
            <button
              onClick={startCreate}
              className="rounded-xl bg-emerald-900 text-white px-4 py-2 font-semibold hover:bg-emerald-800"
              type="button"
            >
              + Neuer Eintrag
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      {editingId && (
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                {editingId === "NEW"
                  ? "Neuen Eintrag anlegen"
                  : "Eintrag bearbeiten"}
              </h2>
              <p className="text-sm text-slate-600">
                Begriff + Definition speichern. (term_normalized wird
                automatisch erzeugt.)
              </p>
            </div>

            <button
              type="button"
              onClick={resetEditor}
              className="text-emerald-900 hover:underline"
            >
              Schließen
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-emerald-900 font-semibold block mb-2">
                Begriff (term)
              </label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="z.B. Immuntherapie"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-emerald-900 font-semibold block mb-2">
                Definition
              </label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                className="w-full min-h-32 rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Definition hier…"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-emerald-900 text-white px-4 py-2 font-semibold hover:bg-emerald-800 disabled:opacity-60"
            >
              Speichern
            </button>

            <button
              type="button"
              onClick={resetEditor}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-emerald-900 hover:bg-emerald-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-emerald-950 mb-4">
          Einträge
        </h2>

        {rows.length === 0 ? (
          <div className="text-slate-600">Keine Einträge gefunden.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div
                key={r.id}
                className="py-4 flex flex-col md:flex-row md:items-start gap-3 md:gap-6"
              >
                <div className="flex-1">
                  <div className="font-semibold text-emerald-950">
                    {r.term ?? "(ohne Begriff)"}
                  </div>
                  <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                    {r.definition ?? ""}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
