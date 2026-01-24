import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../infrastructure/supabase/client";
import AdminLayout from "../../components/AdminLayout";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  is_active: boolean;
  start_question_id: string | null;
};

type Question = {
  id: string;
  position: number;
  text: string;
  is_active: boolean;
};

type Option = {
  id: string;
  question_id: string;
  next_question_id: string | null;
};

function label(text: string, max = 60) {
  const t = (text ?? "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export default function AdminDecisionTrees() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQId, setSelectedQId] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  // MODALS (gleiches Pattern wie AdminQuestionsPage)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeQuestionnaire, setActiveQuestionnaire] =
    useState<Questionnaire | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((q) => q.id === selectedQId) ?? null,
    [questionnaires, selectedQId],
  );

  const sortedQuestionnaires = useMemo(() => {
    const copy = [...questionnaires];
    copy.sort((a, b) => {
      const ai = a.is_active ? 0 : 1;
      const bi = b.is_active ? 0 : 1;
      if (ai !== bi) return ai - bi;
      return (a.code ?? "").localeCompare(b.code ?? "");
    });
    return copy;
  }, [questionnaires]);

  const currentNextForQuestion = useMemo(() => {
    if (!selectedQuestionId) return "";
    const first = options.find((o) => o.question_id === selectedQuestionId);
    return first?.next_question_id ?? "";
  }, [options, selectedQuestionId]);

  const nextTargets = useMemo(() => {
    if (!selectedQuestionId) return questions;
    return questions.filter((q) => q.id !== selectedQuestionId);
  }, [questions, selectedQuestionId]);

  // ---------- LOAD ----------
  useEffect(() => {
    void loadQuestionnaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadQuestionsAndOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQId]);

  async function loadQuestionnaires(preferId?: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("questionnaires")
      .select("id, code, title, description, is_active, start_question_id")
      .order("code", { ascending: true });

    if (error) {
      setError("Fragebögen konnten nicht geladen werden.");
      console.error(error);
      setLoading(false);
      return;
    }

    const list = (data ?? []) as Questionnaire[];
    setQuestionnaires(list);

    setSelectedQId((prev) => {
      const wanted = preferId ?? prev;
      if (wanted && list.some((q) => q.id === wanted)) return wanted;
      return list[0]?.id ?? "";
    });

    setLoading(false);
  }

  async function loadQuestionsAndOptions() {
    if (!selectedQId) {
      setQuestions([]);
      setOptions([]);
      setSelectedQuestionId("");
      return;
    }

    setLoading(true);
    setError(null);

    const qRes = await supabase
      .from("questions")
      .select("id, position, text, is_active")
      .eq("questionnaire_id", selectedQId)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (qRes.error) {
      setError("Fragen konnten nicht geladen werden.");
      console.error(qRes.error);
      setLoading(false);
      return;
    }

    const qs = (qRes.data ?? []) as Question[];
    setQuestions(qs);

    if (qs.length === 0) {
      setOptions([]);
      setSelectedQuestionId("");
      setLoading(false);
      return;
    }

    const ids = qs.map((x) => x.id);

    const oRes = await supabase
      .from("question_options")
      .select("id, question_id, next_question_id")
      .in("question_id", ids);

    if (oRes.error) {
      setError("Optionen konnten nicht geladen werden.");
      console.error(oRes.error);
      setLoading(false);
      return;
    }

    setOptions((oRes.data ?? []) as Option[]);

    setSelectedQuestionId((prev) => {
      if (prev && qs.some((q) => q.id === prev)) return prev;
      return qs[0]?.id ?? "";
    });

    setLoading(false);
  }

  // ---------- MODAL HELPERS ----------
  function openCreateModal() {
    setInfo(null);
    setError(null);

    setFormCode("");
    setFormTitle("");
    setFormDescription("");
    setFormIsActive(true);

    setCreateModalOpen(true);
    setEditModalOpen(false);
    setActiveQuestionnaire(null);
  }

  function openEditModal(q: Questionnaire) {
    setInfo(null);
    setError(null);

    setActiveQuestionnaire(q);
    setFormCode(q.code ?? "");
    setFormTitle(q.title ?? "");
    setFormDescription(q.description ?? "");
    setFormIsActive(Boolean(q.is_active));

    setEditModalOpen(true);
    setCreateModalOpen(false);
  }

  function closeModals() {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setActiveQuestionnaire(null);
  }

  // ---------- CRUD QUESTIONNAIRES ----------
  async function createQuestionnaire() {
    const code = formCode.trim();
    const title = formTitle.trim();
    const description = formDescription.trim() || null;

    if (!code) {
      setError("Bitte einen internen Namen angeben (z. B. immun_v1).");
      return;
    }
    if (!title) {
      setError("Bitte einen Titel angeben.");
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    const { data, error } = await supabase
      .from("questionnaires")
      .insert({
        code,
        title,
        description,
        is_active: true,
        start_question_id: null,
      })
      .select("id, code, title, description, is_active, start_question_id")
      .single();

    if (error) {
      console.error(error);
      setError(error.message);
      setBusy(false);
      return;
    }

    setInfo("Fragebogen wurde angelegt.");
    closeModals();
    await loadQuestionnaires(data?.id);
    setBusy(false);
  }

  async function updateQuestionnaire() {
    if (!activeQuestionnaire) return;

    const code = formCode.trim();
    const title = formTitle.trim();
    const description = formDescription.trim() || null;

    if (!code) {
      setError("Bitte einen internen Namen angeben.");
      return;
    }
    if (!title) {
      setError("Bitte einen Titel angeben.");
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase
      .from("questionnaires")
      .update({
        code,
        title,
        description,
        is_active: formIsActive,
      })
      .eq("id", activeQuestionnaire.id);

    if (error) {
      console.error(error);
      setError(error.message);
      setBusy(false);
      return;
    }

    setInfo("Fragebogen wurde gespeichert.");
    closeModals();
    await loadQuestionnaires(activeQuestionnaire.id);
    setBusy(false);
  }

  async function toggleActive(active: boolean) {
    if (!selectedQuestionnaire) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase
      .from("questionnaires")
      .update({ is_active: active })
      .eq("id", selectedQuestionnaire.id);

    if (error) {
      console.error(error);
      setError(error.message);
      setBusy(false);
      return;
    }

    setInfo(
      active ? "Fragebogen wurde aktiviert." : "Fragebogen wurde deaktiviert.",
    );
    await loadQuestionnaires(selectedQuestionnaire.id);
    setBusy(false);
  }

  async function deleteQuestionnaire() {
    if (!selectedQuestionnaire) return;

    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `Wirklich löschen?\n\n"${selectedQuestionnaire.title}"\n\nAchtung: Wenn noch Fragen/Optionen referenzieren, kann das fehlschlagen (FK-Constraints).`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase
      .from("questionnaires")
      .delete()
      .eq("id", selectedQuestionnaire.id);

    if (error) {
      console.error(error);
      setError(
        `${error.message}\n\nTipp: Wenn das wegen Referenzen fehlschlägt, nutze Deaktivieren oder setze FK ON DELETE CASCADE.`,
      );
      setBusy(false);
      return;
    }

    setInfo("Fragebogen wurde gelöscht.");
    const remaining = questionnaires.filter(
      (q) => q.id !== selectedQuestionnaire.id,
    );
    setQuestionnaires(remaining);
    setSelectedQId(remaining[0]?.id ?? "");
    setQuestions([]);
    setOptions([]);
    setSelectedQuestionId("");
    setBusy(false);
  }

  // ---------- START / NEXT ----------
  async function saveStartQuestion(startQuestionId: string | null) {
    if (!selectedQId) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase
      .from("questionnaires")
      .update({ start_question_id: startQuestionId })
      .eq("id", selectedQId);

    if (error) {
      console.error(error);
      setError(error.message);
      setBusy(false);
      return;
    }

    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === selectedQId ? { ...q, start_question_id: startQuestionId } : q,
      ),
    );

    setInfo("Startfrage wurde gespeichert.");
    setBusy(false);
  }

  async function saveNextForQuestion(nextQuestionId: string | null) {
    if (!selectedQuestionId) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    // lineares Routing: für alle Optionen gleich setzen
    const { error } = await supabase
      .from("question_options")
      .update({ next_question_id: nextQuestionId })
      .eq("question_id", selectedQuestionId);

    if (error) {
      console.error(error);
      setError(error.message);
      setBusy(false);
      return;
    }

    setOptions((prev) =>
      prev.map((o) =>
        o.question_id === selectedQuestionId
          ? { ...o, next_question_id: nextQuestionId }
          : o,
      ),
    );

    setInfo("Nächste Frage wurde gespeichert.");
    setBusy(false);
  }

  return (
    <AdminLayout title="Fragebogen zusammenstellen">
      {(error || info) && (
        <div className="mb-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 whitespace-pre-wrap">
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

      {(loading || busy) && (
        <div className="mb-4 text-emerald-900">
          {loading ? "Lade…" : "Speichere…"}
        </div>
      )}

      {/* Fragebögen verwalten */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-xl font-semibold text-emerald-950">
                Fragebögen verwalten
              </div>
              <div className="text-emerald-900 text-sm">
                Anlegen, bearbeiten, deaktivieren oder löschen.
              </div>
            </div>

            <button
              onClick={openCreateModal}
              disabled={busy}
              className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              + Neuer Fragebogen
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <label className="text-emerald-900 font-semibold min-w-40">
              Auswahl
            </label>

            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={selectedQId}
              onChange={(e) => setSelectedQId(e.target.value)}
              disabled={busy || loading}
            >
              {sortedQuestionnaires.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.is_active ? "" : "⛔ "}[{q.code}] {label(q.title, 80)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  selectedQuestionnaire && openEditModal(selectedQuestionnaire)
                }
                disabled={!selectedQuestionnaire || busy}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
              >
                Bearbeiten
              </button>

              {selectedQuestionnaire?.is_active ? (
                <button
                  onClick={() => void toggleActive(false)}
                  disabled={!selectedQuestionnaire || busy}
                  className="rounded-full border border-amber-200 bg-amber-50 px-5 py-2 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  Deaktivieren
                </button>
              ) : (
                <button
                  onClick={() => void toggleActive(true)}
                  disabled={!selectedQuestionnaire || busy}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
                >
                  Aktivieren
                </button>
              )}

              <button
                onClick={() => void deleteQuestionnaire()}
                disabled={!selectedQuestionnaire || busy}
                className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
              >
                Löschen
              </button>
            </div>
          </div>

          {selectedQuestionnaire?.description ? (
            <div className="text-sm text-emerald-900">
              <span className="font-semibold">Beschreibung: </span>
              {selectedQuestionnaire.description}
            </div>
          ) : null}
        </div>
      </div>

      {/* Startfrage */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <label className="text-emerald-900 font-semibold min-w-40">
            Startfrage
          </label>

          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={selectedQuestionnaire?.start_question_id ?? ""}
            onChange={(e) => void saveStartQuestion(e.target.value || null)}
            disabled={busy || loading || !selectedQuestionnaire}
          >
            <option value="">— keine Startfrage —</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {label(q.text, 90)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fragen + Nächste Frage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-emerald-950 mb-4">
            Fragen
          </h2>

          {questions.length === 0 ? (
            <p className="text-emerald-900">Keine Fragen gefunden.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-1">
              {questions.map((q) => {
                const isActive = q.id === selectedQuestionId;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`text-left rounded-2xl px-4 py-3 border transition ${
                      isActive
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                    disabled={busy}
                  >
                    <div className="text-sm text-slate-600">
                      Position {q.position} ·{" "}
                      {q.is_active ? "aktiv" : "inaktiv"}
                    </div>
                    <div className="font-semibold text-emerald-950">
                      {label(q.text, 95)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-emerald-950 mb-1">
            Nächste Frage
          </h2>

          <p className="text-emerald-900 mb-4">
            {selectedQuestionId
              ? "Wähle die nächste Frage aus."
              : "Wähle links eine Frage."}
          </p>

          {!selectedQuestionId ? (
            <p className="text-emerald-900">Keine Frage ausgewählt.</p>
          ) : (
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={currentNextForQuestion}
              onChange={(e) => void saveNextForQuestion(e.target.value || null)}
              disabled={busy || loading}
            >
              <option value="">— Ende (Fragebogen abschließen) —</option>
              {nextTargets.map((q) => (
                <option key={q.id} value={q.id}>
                  {label(q.text, 90)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* CREATE MODAL (wie Questions-Modal) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-emerald-950">
                  Neuer Fragebogen
                </h3>
                <div className="text-sm text-emerald-900">
                  Interner Name sollte eindeutig sein (z. B.{" "}
                  <span className="font-semibold">immun_v1</span>).
                </div>
              </div>
              <button
                onClick={closeModals}
                className="text-slate-600 hover:text-slate-900"
                disabled={busy}
                title="Schließen"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Interner Name *
                </label>
                <input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="z. B. immun_v1"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Titel *
                </label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="z. B. Immuntherapie – Nebenwirkungen"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  rows={3}
                  placeholder="Kurz erklären, wofür der Fragebogen gedacht ist…"
                  disabled={busy}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={closeModals}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                  disabled={busy}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => void createQuestionnaire()}
                  className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-2 font-semibold disabled:opacity-60"
                  disabled={busy}
                >
                  Anlegen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (wie Questions-Modal) */}
      {editModalOpen && activeQuestionnaire && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-emerald-950">
                  Fragebogen bearbeiten
                </h3>
                <div className="text-sm text-emerald-900">
                  Änderungen wirken sofort in der Verwaltung.
                </div>
              </div>
              <button
                onClick={closeModals}
                className="text-slate-600 hover:text-slate-900"
                disabled={busy}
                title="Schließen"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Interner Name *
                </label>
                <input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Titel *
                </label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  rows={3}
                  disabled={busy}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  disabled={busy}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="is_active"
                  className="text-emerald-900 font-semibold"
                >
                  Aktiv
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={closeModals}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                  disabled={busy}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => void updateQuestionnaire()}
                  className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-2 font-semibold disabled:opacity-60"
                  disabled={busy}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
