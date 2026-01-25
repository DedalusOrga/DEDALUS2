import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../infrastructure/supabase/client";
import AdminLayout from "../../components/admin/AdminLayout";

type Questionnaire = { id: string; code: string; title: string };
type Category = "niedrig" | "mittel" | "hoch";

type RecommendationRow = {
  id: string;
  questionnaire_id: string;
  category: Category;
  body_md: string | null;
  status: string;
};

type FormState = {
  category: Category;
  recId: string | null;
  body_md: string;
};

const CATEGORY_META: Record<Category, { title: string; help: string }> = {
  niedrig: {
    title: "Niedrig",
    help: "Wird angezeigt, wenn die Auswertung eine niedrige Belastung / niedrige Risikoeinschätzung ergibt.",
  },
  mittel: {
    title: "Mittel",
    help: "Wird angezeigt, wenn die Auswertung eine mittlere Belastung oder eine unklare Situation ergibt.",
  },
  hoch: {
    title: "Hoch",
    help: "Wird angezeigt, wenn die Auswertung eine hohe Belastung / erhöhtes Risiko ergibt (ggf. zeitnahe Abklärung).",
  },
};

function formatSbError(err: any) {
  if (!err) return "unknown error";
  return [
    err.message ?? "no message",
    err.code ? `code=${err.code}` : null,
    err.details ? `details=${err.details}` : null,
    err.hint ? `hint=${err.hint}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

export default function AdminQuestionnaireRecommendationsPage() {
  // Fragebogen
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState("");

  // vorhandene Empfehlungen
  const [recs, setRecs] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [form, setForm] = useState<FormState>({
    category: "niedrig",
    recId: null,
    body_md: "",
  });

  // UI state
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const busy = loading || loadingEdit || saving;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const recByCategory = useMemo(() => {
    const map: Record<Category, RecommendationRow | null> = {
      niedrig: null,
      mittel: null,
      hoch: null,
    };
    for (const r of recs) {
      if (!map[r.category]) map[r.category] = r;
    }
    return map;
  }, [recs]);

  useEffect(() => {
    void loadQuestionnaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedQuestionnaireId) return;
    void loadRecommendations(selectedQuestionnaireId).then(() => {
      void startEditCategory("niedrig");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestionnaireId]);

  async function loadQuestionnaires() {
    setError(null);

    const { data, error } = await supabase
      .from("questionnaires")
      .select("id, code, title")
      .order("code", { ascending: true });

    if (error) {
      console.error(error);
      setError("Fragebögen konnten nicht geladen werden.");
      return;
    }

    const list = (data ?? []) as Questionnaire[];
    setQuestionnaires(list);
    setSelectedQuestionnaireId((prev) => prev || list[0]?.id || "");
  }

  async function loadRecommendations(questionnaireId: string) {
    setLoading(true);
    setError(null);
    setInfo(null);

    const { data, error } = await supabase
      .from("questionnaire_recommendations")
      .select("id, questionnaire_id, category, body_md, status")
      .eq("questionnaire_id", questionnaireId);

    setLoading(false);

    if (error) {
      console.error(error);
      setError("Empfehlungen konnten nicht geladen werden.");
      return;
    }

    setRecs((data ?? []) as RecommendationRow[]);
  }

  async function startEditCategory(category: Category) {
    setError(null);
    setInfo(null);
    setLoadingEdit(true);

    if (!selectedQuestionnaireId) {
      setLoadingEdit(false);
      return;
    }

    // vorhandene Row (aus Cache)
    const existing = recByCategory[category];

    // noch nicht angelegt
    if (!existing) {
      setForm({ category, recId: null, body_md: "" });
      setLoadingEdit(false);
      return;
    }

    // fresh load aus DB
    const fresh = await supabase
      .from("questionnaire_recommendations")
      .select("id, category, body_md")
      .eq("id", existing.id)
      .single();

    setLoadingEdit(false);

    if (fresh.error) {
      console.error(fresh.error);
      setError(
        `Empfehlung konnte nicht geladen werden: ${formatSbError(fresh.error)}`,
      );
      return;
    }

    setForm({
      category,
      recId: fresh.data.id,
      body_md: fresh.data.body_md ?? "",
    });
  }

  async function save() {
    if (!selectedQuestionnaireId) {
      setError("Bitte zuerst einen Fragebogen auswählen.");
      return;
    }

    const body = (form.body_md ?? "").trim();
    if (!body) {
      setError("Bitte einen Empfehlungstext eingeben.");
      return;
    }

    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      if (form.recId) {
        const upd = await supabase
          .from("questionnaire_recommendations")
          .update({ body_md: body })
          .eq("id", form.recId);

        if (upd.error) {
          setError(`Speichern fehlgeschlagen: ${formatSbError(upd.error)}`);
          return;
        }

        setInfo("Empfehlung wurde gespeichert.");
      } else {
        const ins = await supabase
          .from("questionnaire_recommendations")
          .insert([
            {
              questionnaire_id: selectedQuestionnaireId,
              category: form.category,
              body_md: body,
              status: "published",
            },
          ]);

        if (ins.error) {
          setError(`Anlegen fehlgeschlagen: ${formatSbError(ins.error)}`);
          return;
        }

        setInfo("Empfehlung wurde angelegt.");
      }

      await loadRecommendations(selectedQuestionnaireId);
      await startEditCategory(form.category);
    } finally {
      setSaving(false);
    }
  }

  async function removeActive() {
    if (!form.recId) return;

    const ok = window.confirm("Empfehlung wirklich löschen?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const del = await supabase
        .from("questionnaire_recommendations")
        .delete()
        .eq("id", form.recId);

      if (del.error) {
        setError(`Löschen fehlgeschlagen: ${formatSbError(del.error)}`);
        return;
      }

      setInfo("Empfehlung wurde gelöscht.");
      await loadRecommendations(selectedQuestionnaireId);
      await startEditCategory(form.category);
    } finally {
      setSaving(false);
    }
  }

  const tabBase =
    "px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap";
  const tabActive = "bg-emerald-900 text-white";
  const tabInactive = "text-emerald-900 hover:bg-emerald-50";

  const statusText = recByCategory[form.category]
    ? "vorhanden"
    : "noch nicht angelegt";

  return (
    <AdminLayout title="Admin – Empfehlungstexte">
      {(error || info) && (
        <div className="mb-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 mt-3">
              {info}
            </div>
          )}
        </div>
      )}

      {/* Fragebogen auswählen */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-emerald-950 mb-4">
          Fragebogen auswählen
        </h2>

        <select
          value={selectedQuestionnaireId}
          onChange={(e) => setSelectedQuestionnaireId(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          disabled={busy}
        >
          {questionnaires.map((q) => (
            <option key={q.id} value={q.id}>
              {q.code} – {q.title}
            </option>
          ))}
        </select>

        <div className="text-sm text-slate-600 mt-3">
          Wählen Sie den Fragebogen aus, für den die Empfehlungstexte gepflegt
          werden sollen.
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-emerald-950">
              Empfehlungstext bearbeiten
            </h2>
            <div className="text-sm text-slate-600 mt-1">
              {CATEGORY_META[form.category].help}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              selectedQuestionnaireId &&
              void loadRecommendations(selectedQuestionnaireId).then(() =>
                startEditCategory(form.category),
              )
            }
            className="text-emerald-900 underline"
            disabled={busy || !selectedQuestionnaireId}
          >
            Aktualisieren
          </button>
        </div>

        {/* Kategorie Tabs */}
        <div className="inline-flex bg-white rounded-full shadow-sm p-1 border border-slate-100 gap-1 mb-4">
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => void startEditCategory(cat)}
              className={`${tabBase} ${form.category === cat ? tabActive : tabInactive}`}
              disabled={busy}
            >
              {CATEGORY_META[cat].title}
            </button>
          ))}
        </div>

        {/* Textarea */}
        {loadingEdit ? (
          <div className="text-emerald-900">Lade Inhalt…</div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <textarea
              value={form.body_md}
              onChange={(e) => setField("body_md", e.target.value)}
              className="w-full p-4 text-[15px] leading-7 outline-none"
              style={{ minHeight: 260, maxHeight: "60vh", overflowY: "auto" }}
              disabled={busy}
              placeholder="Hier den Empfehlungstext eingeben…"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <div className="text-sm text-slate-600">
            Status:{" "}
            <span className="font-semibold text-emerald-950">{statusText}</span>
          </div>

          <div className="flex items-center gap-3">
            {form.recId && (
              <button
                type="button"
                onClick={() => void removeActive()}
                className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                disabled={busy}
              >
                Löschen
              </button>
            )}

            <button
              type="button"
              onClick={() => void save()}
              className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-2 font-semibold disabled:opacity-60"
              disabled={busy}
            >
              {saving ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-3">
          Hinweis: Speichern Sie nach jeder Änderung. Die Texte werden später im
          Ergebnisbereich für die jeweilige Kategorie angezeigt.
        </div>
      </div>
    </AdminLayout>
  );
}
