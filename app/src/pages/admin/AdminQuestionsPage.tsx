import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/supabase/client";
import { useAuth } from "../../hooks/AuthProvider";
import AdminLayout from "../../components/admin/AdminLayout";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
};

type Question = {
  id: string;
  questionnaire_id: string;
  position: number;
  text: string;
  is_active: boolean;
};

type QuestionOption = {
  id: string;
  question_id: string;
  position: number;
  text: string;
  value: string;
  next_question_id: string | null;
};

function label(text: string, max = 90) {
  const t = (text ?? "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

const DEFAULT_OPTION_COUNT = 5;
const MIN_OPTIONS = 1;
const MAX_OPTIONS = 10;

export default function AdminQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Tabs aktiv erkennen
  const isQuestions = location.pathname.startsWith("/admin/questions");
  const isRouting = location.pathname.startsWith("/admin/decision-trees");
  const isContent = !isQuestions && !isRouting; // default /admin

  // global feedback
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // selection
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] =
    useState<string>("");

  // list
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // create new question
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionCount, setNewOptionCount] =
    useState<number>(DEFAULT_OPTION_COUNT);
  const [newOptions, setNewOptions] = useState<string[]>(
    Array.from({ length: DEFAULT_OPTION_COUNT }, () => ""),
  );

  // modal edit
  const [modalOpen, setModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const [editText, setEditText] = useState("");
  const [editOptionCount, setEditOptionCount] =
    useState<number>(DEFAULT_OPTION_COUNT);
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((q) => q.id === selectedQuestionnaireId) ?? null,
    [questionnaires, selectedQuestionnaireId],
  );

  useEffect(() => {
    void loadQuestionnaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedQuestionnaireId) return;
    void loadQuestions(selectedQuestionnaireId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestionnaireId]);

  // Keep option arrays in sync with counts
  useEffect(() => {
    setNewOptions((prev) => {
      const next = [...prev];
      if (newOptionCount > next.length) {
        while (next.length < newOptionCount) next.push("");
      } else if (newOptionCount < next.length) {
        next.length = newOptionCount;
      }
      return next;
    });
  }, [newOptionCount]);

  useEffect(() => {
    setEditOptions((prev) => {
      const next = [...prev];
      if (editOptionCount > next.length) {
        while (next.length < editOptionCount) next.push("");
      } else if (editOptionCount < next.length) {
        next.length = editOptionCount;
      }
      return next;
    });
  }, [editOptionCount]);

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

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

    // auto-select first if none selected
    setSelectedQuestionnaireId((prev) => prev || list[0]?.id || "");
  }

  async function loadQuestions(questionnaireId: string) {
    setLoadingQuestions(true);
    setError(null);

    const { data, error } = await supabase
      .from("questions")
      .select("id, questionnaire_id, position, text, is_active")
      .eq("questionnaire_id", questionnaireId)
      .order("position", { ascending: true });

    if (error) {
      console.error(error);
      setError("Fragen konnten nicht geladen werden.");
      setLoadingQuestions(false);
      return;
    }

    setQuestions((data ?? []) as Question[]);
    setLoadingQuestions(false);
  }

  function nextQuestionPosition() {
    const maxPos = questions.reduce((m, q) => Math.max(m, q.position ?? 0), 0);
    return maxPos + 1;
  }

  async function createQuestion() {
    if (!selectedQuestionnaireId) {
      setError("Bitte zuerst einen Fragebogen auswählen.");
      return;
    }

    const text = newQuestionText.trim();
    if (!text) {
      setError("Bitte einen Fragetext eingeben.");
      return;
    }

    // Option-Texte (leer = erlauben? -> ich filtere leere raus, aber min. 1 nicht-leer)
    const optionTexts = (newOptions ?? []).map((s) => s.trim());
    const nonEmpty = optionTexts.filter((s) => s.length > 0);
    if (nonEmpty.length === 0) {
      setError("Bitte mindestens eine Option ausfüllen.");
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      // 1) Insert question
      const position = nextQuestionPosition();
      const { data: qData, error: qErr } = await supabase
        .from("questions")
        .insert([
          {
            questionnaire_id: selectedQuestionnaireId,
            position,
            text,
            is_active: true,
          },
        ])
        .select("id")
        .single();

      if (qErr) throw qErr;

      const questionId = qData.id as string;

      // 2) Insert options (positions start at 1)
      const rows = nonEmpty.map((t, idx) => ({
        question_id: questionId,
        position: idx + 1,
        text: t,
        value: `opt_${idx + 1}`,
        next_question_id: null,
      }));

      const { error: oErr } = await supabase
        .from("question_options")
        .insert(rows);

      if (oErr) throw oErr;

      setInfo("Frage wurde angelegt.");
      setNewQuestionText("");
      setNewOptionCount(DEFAULT_OPTION_COUNT);
      setNewOptions(Array.from({ length: DEFAULT_OPTION_COUNT }, () => ""));
      await loadQuestions(selectedQuestionnaireId);
    } catch (e: any) {
      console.error(e);
      setError("Frage konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  async function openEdit(q: Question) {
    setModalOpen(true);
    setActiveQuestion(q);
    setEditLoading(true);
    setError(null);
    setInfo(null);

    try {
      setEditText(q.text ?? "");

      const { data, error } = await supabase
        .from("question_options")
        .select("id, question_id, position, text, value, next_question_id")
        .eq("question_id", q.id)
        .order("position", { ascending: true });

      if (error) throw error;

      const opts = (data ?? []) as QuestionOption[];
      const texts = opts.map((o) => o.text ?? "");
      const count = Math.max(
        MIN_OPTIONS,
        Math.min(MAX_OPTIONS, texts.length || DEFAULT_OPTION_COUNT),
      );

      setEditOptionCount(count);
      // ensure array length fits count
      const padded = [...texts];
      while (padded.length < count) padded.push("");
      if (padded.length > count) padded.length = count;

      setEditOptions(padded);
    } catch (e: any) {
      console.error(e);
      setError("Optionen konnten nicht geladen werden.");
    } finally {
      setEditLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setActiveQuestion(null);
    setEditText("");
    setEditOptionCount(DEFAULT_OPTION_COUNT);
    setEditOptions([]);
    setEditLoading(false);
  }

  async function saveEdit() {
    if (!activeQuestion) return;

    const text = editText.trim();
    if (!text) {
      setError("Fragetext darf nicht leer sein.");
      return;
    }

    const optionTexts = (editOptions ?? []).map((s) => s.trim());
    const nonEmpty = optionTexts.filter((s) => s.length > 0);
    if (nonEmpty.length === 0) {
      setError("Bitte mindestens eine Option ausfüllen.");
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      // 1) Update question
      const { error: qErr } = await supabase
        .from("questions")
        .update({ text })
        .eq("id", activeQuestion.id);

      if (qErr) throw qErr;

      // 2) Simplest + robust: delete existing options and re-insert
      // (Wenn du next_question_id später pflegen willst, machen wir das gezielt, statt alles zu löschen.)
      const { error: dErr } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", activeQuestion.id);

      if (dErr) throw dErr;

      const rows = nonEmpty.map((t, idx) => ({
        question_id: activeQuestion.id,
        position: idx + 1,
        text: t,
        value: `opt_${idx + 1}`,
        next_question_id: null,
      }));

      const { error: iErr } = await supabase
        .from("question_options")
        .insert(rows);

      if (iErr) throw iErr;

      setInfo("Frage wurde gespeichert.");
      await loadQuestions(activeQuestion.questionnaire_id);
      closeModal();
    } catch (e: any) {
      console.error(e);
      setError("Änderungen konnten nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteQuestion(q: Question) {
    const ok = window.confirm("Frage wirklich löschen?");
    if (!ok) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      // 1) delete options
      const { error: dOptErr } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", q.id);
      if (dOptErr) throw dOptErr;

      // 2) delete question
      const { error: dQErr } = await supabase
        .from("questions")
        .delete()
        .eq("id", q.id);
      if (dQErr) throw dQErr;

      setInfo("Frage wurde gelöscht.");
      await loadQuestions(q.questionnaire_id);
    } catch (e: any) {
      console.error(e);
      setError("Frage konnte nicht gelöscht werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout title="Admin">
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

      {/* Select questionnaire */}
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
              {q.title} ({q.code})
            </option>
          ))}
        </select>

        {!selectedQuestionnaire && (
          <div className="mt-3 text-emerald-900">
            Keine Fragebögen gefunden.
          </div>
        )}
      </div>

      {/* Create new question */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-emerald-950 mb-4">
          Neue Frage hinzufügen
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              Fragetext
            </label>
            <textarea
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              rows={3}
              disabled={busy}
              placeholder="z.B. Welche Nebenwirkung trifft am ehesten zu?"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="text-sm font-semibold text-emerald-900">
              Anzahl Optionen
            </label>
            <input
              type="number"
              min={MIN_OPTIONS}
              max={MAX_OPTIONS}
              value={newOptionCount}
              onChange={(e) =>
                setNewOptionCount(
                  Math.max(
                    MIN_OPTIONS,
                    Math.min(MAX_OPTIONS, Number(e.target.value || 1)),
                  ),
                )
              }
              className="w-36 rounded-xl border border-slate-200 px-3 py-2"
              disabled={busy}
            />
            <span className="text-sm text-slate-600">
              (min. {MIN_OPTIONS}, max. {MAX_OPTIONS})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {newOptions.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-sm font-semibold text-emerald-900 mb-1">
                  Option {idx + 1}
                </label>
                <input
                  value={opt}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewOptions((prev) => {
                      const next = [...prev];
                      next[idx] = v;
                      return next;
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  disabled={busy}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => void createQuestion()}
            disabled={busy || !selectedQuestionnaireId}
            className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Frage anlegen
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-950">
            Fragen – {selectedQuestionnaire?.code ?? "—"}
          </h2>

          <button
            onClick={() =>
              selectedQuestionnaireId &&
              void loadQuestions(selectedQuestionnaireId)
            }
            className="text-emerald-900 underline"
            disabled={busy || !selectedQuestionnaireId}
          >
            Aktualisieren
          </button>
        </div>

        {loadingQuestions ? (
          <div className="text-emerald-900">Lade…</div>
        ) : questions.length === 0 ? (
          <div className="text-emerald-900">Noch keine Fragen vorhanden.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-100 px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-600">
                      Position {q.position} ·{" "}
                      {q.is_active ? "aktiv" : "inaktiv"}
                    </div>
                    <div className="font-semibold text-emerald-950">
                      {label(q.text)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void openEdit(q)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                      disabled={busy}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => void deleteQuestion(q)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                      disabled={busy}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-emerald-950">
                Frage bearbeiten
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-600 hover:text-slate-900"
                disabled={busy}
                title="Schließen"
              >
                ✕
              </button>
            </div>

            {editLoading ? (
              <div className="text-emerald-900">Lade…</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Fragetext
                  </label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                    rows={3}
                    disabled={busy}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <label className="text-sm font-semibold text-emerald-900">
                    Anzahl Optionen
                  </label>
                  <input
                    type="number"
                    min={MIN_OPTIONS}
                    max={MAX_OPTIONS}
                    value={editOptionCount}
                    onChange={(e) =>
                      setEditOptionCount(
                        Math.max(
                          MIN_OPTIONS,
                          Math.min(MAX_OPTIONS, Number(e.target.value || 1)),
                        ),
                      )
                    }
                    className="w-36 rounded-xl border border-slate-200 px-3 py-2"
                    disabled={busy}
                  />
                  <span className="text-sm text-slate-600">
                    (min. {MIN_OPTIONS}, max. {MAX_OPTIONS})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {editOptions.map((opt, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-semibold text-emerald-900 mb-1">
                        Option {idx + 1}
                      </label>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEditOptions((prev) => {
                            const next = [...prev];
                            next[idx] = v;
                            return next;
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2"
                        disabled={busy}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                    disabled={busy}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => void saveEdit()}
                    className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-2 font-semibold disabled:opacity-60"
                    disabled={busy}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
