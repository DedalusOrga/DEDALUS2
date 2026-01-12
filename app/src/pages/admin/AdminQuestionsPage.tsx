import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/supabase/client";

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

  const isQuestions = location.pathname.startsWith("/admin/questions");

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
  const [newOptions, setNewOptions] = useState<string[]>(
    Array.from({ length: DEFAULT_OPTION_COUNT }, () => "")
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
    [questionnaires, selectedQuestionnaireId]
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

    if (!selectedQuestionnaireId && list.length > 0) {
      setSelectedQuestionnaireId(list[0].id);
    }
  }

  async function loadQuestions(qid: string) {
    setLoadingQuestions(true);
    setError(null);
    setInfo(null);

    const { data, error } = await supabase
      .from("questions")
      .select("id, questionnaire_id, position, text, is_active")
      .eq("questionnaire_id", qid)
      .eq("is_active", true)
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

  // ---------- Create new question + options ----------
  function updateNewOption(index: number, value: string) {
    setNewOptions((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addNewOptionRow() {
    setNewOptions((prev) =>
      prev.length >= MAX_OPTIONS ? prev : [...prev, ""]
    );
  }

  function removeNewOptionRow(index: number) {
    setNewOptions((prev) =>
      prev.length <= MIN_OPTIONS ? prev : prev.filter((_, i) => i !== index)
    );
  }

  async function addQuestionWithOptions() {
    if (!selectedQuestionnaireId) return;

    setError(null);
    setInfo(null);

    const questionText = newQuestionText.trim();
    if (!questionText) {
      setError("Bitte einen Fragetext eingeben.");
      return;
    }

    const opts = newOptions.map((t) => t.trim()).filter((t) => t.length > 0);
    if (opts.length === 0) {
      setError("Bitte mindestens eine Option eingeben.");
      return;
    }

    setBusy(true);

    const nextPos =
      (questions.reduce((m, q) => Math.max(m, q.position), 0) || 0) + 1;

    // 1) insert question and get id
    const qInsert = await supabase
      .from("questions")
      .insert([
        {
          questionnaire_id: selectedQuestionnaireId,
          position: nextPos,
          text: questionText,
          is_active: true,
        },
      ])
      .select("id")
      .single();

    if (qInsert.error) {
      console.error(qInsert.error);
      setError("Frage konnte nicht angelegt werden.");
      setBusy(false);
      return;
    }

    const questionId = qInsert.data.id as string;

    // 2) insert options (value=text, next_question_id=null)
    const payload = opts.map((t, idx) => ({
      question_id: questionId,
      position: idx + 1,
      text: t,
      value: t,
      next_question_id: null,
    }));

    const oInsert = await supabase.from("question_options").insert(payload);

    if (oInsert.error) {
      console.error(oInsert.error);
      setError(
        "Frage wurde angelegt, aber Optionen konnten nicht gespeichert werden."
      );
      setBusy(false);
      return;
    }

    setNewQuestionText("");
    setNewOptions(Array.from({ length: DEFAULT_OPTION_COUNT }, () => ""));
    setInfo("Frage + Optionen gespeichert.");

    await loadQuestions(selectedQuestionnaireId);
    setBusy(false);
  }

  // ---------- Delete question (soft) ----------
  async function deleteQuestion(q: Question) {
    setError(null);
    setInfo(null);
    setBusy(true);

    const { error } = await supabase
      .from("questions")
      .update({ is_active: false })
      .eq("id", q.id);
    if (error) {
      console.error(error);
      setError("Frage konnte nicht gelöscht werden.");
      setBusy(false);
      return;
    }

    setInfo("Frage gelöscht.");
    await loadQuestions(selectedQuestionnaireId);
    setBusy(false);
  }

  // ---------- Modal: open & load options ----------
  async function openEditModal(q: Question) {
    setError(null);
    setInfo(null);

    setActiveQuestion(q);
    setEditText(q.text);
    setEditOptionCount(DEFAULT_OPTION_COUNT);
    setEditOptions([]);
    setModalOpen(true);

    setEditLoading(true);

    const { data, error } = await supabase
      .from("question_options")
      .select("id, question_id, position, text, value, next_question_id")
      .eq("question_id", q.id)
      .order("position", { ascending: true });

    if (error) {
      console.error(error);
      setError("Optionen konnten nicht geladen werden.");
      setEditLoading(false);
      return;
    }

    const opts = (data ?? []) as QuestionOption[];
    const texts = opts.map((o) => o.text ?? "");

    // Wenn weniger/more da ist: wir spiegeln den aktuellen DB-Zustand
    const count = Math.min(
      Math.max(texts.length || DEFAULT_OPTION_COUNT, MIN_OPTIONS),
      MAX_OPTIONS
    );

    setEditOptionCount(count);

    // genau "count" Felder im Modal
    const padded = Array.from({ length: count }, (_, i) => texts[i] ?? "");
    setEditOptions(padded);

    setEditLoading(false);
  }

  function closeModal() {
    if (busy) return;
    setModalOpen(false);
    setActiveQuestion(null);
    setEditText("");
    setEditOptionCount(DEFAULT_OPTION_COUNT);
    setEditOptions([]);
  }

  function onChangeOptionCount(n: number) {
    const clamped = Math.min(Math.max(n, MIN_OPTIONS), MAX_OPTIONS);
    setEditOptionCount(clamped);

    setEditOptions((prev) => {
      if (prev.length === clamped) return prev;
      if (prev.length < clamped)
        return [
          ...prev,
          ...Array.from({ length: clamped - prev.length }, () => ""),
        ];
      return prev.slice(0, clamped);
    });
  }

  function updateEditOption(index: number, value: string) {
    setEditOptions((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  // ---------- Modal: Save question + options ----------
  async function saveQuestionAndOptions() {
    if (!activeQuestion) return;

    setError(null);
    setInfo(null);

    const t = editText.trim();
    if (!t) {
      setError("Der Fragetext darf nicht leer sein.");
      return;
    }

    // Optionen: wir erlauben leere Felder nicht, sonst hast du später unsichtbare Radiobuttons
    const normalized = editOptions.map((x) => x.trim());
    if (normalized.some((x) => x.length === 0)) {
      setError("Bitte alle Optionen ausfüllen (oder Anzahl reduzieren).");
      return;
    }

    setBusy(true);

    // 1) Question text update
    const qUp = await supabase
      .from("questions")
      .update({ text: t })
      .eq("id", activeQuestion.id);
    if (qUp.error) {
      console.error(qUp.error);
      setError("Frage konnte nicht gespeichert werden.");
      setBusy(false);
      return;
    }

    // 2) Fetch existing options to decide update/insert/delete
    const existingRes = await supabase
      .from("question_options")
      .select("id, position")
      .eq("question_id", activeQuestion.id)
      .order("position", { ascending: true });

    if (existingRes.error) {
      console.error(existingRes.error);
      setError("Optionen konnten nicht synchronisiert werden.");
      setBusy(false);
      return;
    }

    const existing = (existingRes.data ?? []) as {
      id: string;
      position: number;
    }[];

    // Map position -> id
    const byPos = new Map<number, string>();
    existing.forEach((o) => byPos.set(o.position, o.id));

    // Update or insert positions 1..N
    for (let i = 0; i < normalized.length; i++) {
      const position = i + 1;
      const text = normalized[i];
      const id = byPos.get(position);

      if (id) {
        const u = await supabase
          .from("question_options")
          .update({ text, value: text })
          .eq("id", id);

        if (u.error) {
          console.error(u.error);
          setError("Optionen konnten nicht gespeichert werden.");
          setBusy(false);
          return;
        }
      } else {
        const ins = await supabase.from("question_options").insert([
          {
            question_id: activeQuestion.id,
            position,
            text,
            value: text,
            next_question_id: null,
          },
        ]);

        if (ins.error) {
          console.error(ins.error);
          setError("Optionen konnten nicht hinzugefügt werden.");
          setBusy(false);
          return;
        }
      }
    }

    // Delete options with position > N
    const toDelete = existing
      .filter((o) => o.position > normalized.length)
      .map((o) => o.id);
    if (toDelete.length > 0) {
      const del = await supabase
        .from("question_options")
        .delete()
        .in("id", toDelete);
      if (del.error) {
        console.error(del.error);
        setError("Überzählige Optionen konnten nicht gelöscht werden.");
        setBusy(false);
        return;
      }
    }

    setInfo("Frage + Optionen gespeichert.");
    await loadQuestions(selectedQuestionnaireId);

    setBusy(false);
    closeModal();
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mb-4">
            Admin – Fragen
          </h1>

          {/* Navigation “Tabs” */}
          <div className="inline-flex bg-white rounded-full shadow-sm p-1 border border-slate-100">
            <button
              onClick={() => navigate("/admin")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                !isQuestions
                  ? "bg-emerald-900 text-white"
                  : "text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              Inhalte
            </button>
            <button
              onClick={() => navigate("/admin/questions")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                isQuestions
                  ? "bg-emerald-900 text-white"
                  : "text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              Fragen
            </button>
          </div>
        </div>

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

        {/* Selector + Create */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center mb-6">
            <label className="text-emerald-900 font-semibold">Fragebogen</label>
            <div className="md:col-span-2">
              <select
                value={selectedQuestionnaireId}
                onChange={(e) => setSelectedQuestionnaireId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
              >
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {label(q.title, 90)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
            <div className="text-emerald-950 font-semibold mb-3">
              Neue Frage + Optionen
            </div>

            <input
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 mb-4"
              placeholder="Fragetext…"
              disabled={busy}
            />

            <div className="space-y-2">
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={opt}
                    onChange={(e) => updateNewOption(idx, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2"
                    placeholder={`Option ${idx + 1}…`}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => removeNewOptionRow(idx)}
                    className="text-emerald-900 underline disabled:opacity-60"
                    disabled={busy || newOptions.length <= MIN_OPTIONS}
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={addNewOptionRow}
                className="text-emerald-900 underline disabled:opacity-60"
                disabled={busy || newOptions.length >= MAX_OPTIONS}
              >
                + Option hinzufügen
              </button>

              <button
                type="button"
                onClick={addQuestionWithOptions}
                disabled={busy || !selectedQuestionnaireId}
                className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Speichern
              </button>
            </div>

            <div className="mt-3 text-xs text-emerald-800">
              Hinweis:{" "}
              <code className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                value
              </code>{" "}
              wird automatisch = Text gesetzt.
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-emerald-950">Fragen</h2>
            <div className="text-sm text-emerald-800">
              {loadingQuestions ? "Lade…" : `${questions.length} Einträge`}
            </div>
          </div>

          {loadingQuestions ? (
            <div className="text-emerald-900">Lade…</div>
          ) : questions.length === 0 ? (
            <div className="text-emerald-900">Keine Fragen vorhanden.</div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => openEditModal(q)}
                  className="w-full text-left rounded-3xl border border-slate-100 p-5 hover:bg-slate-50 transition"
                  disabled={busy}
                >
                  <div className="text-emerald-950 leading-relaxed">
                    {q.text}
                  </div>
                  <div className="mt-3 flex gap-4">
                    <span className="text-emerald-900 underline text-sm">
                      Bearbeiten
                    </span>
                    <span
                      className="text-emerald-900 underline text-sm opacity-80"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void deleteQuestion(q);
                      }}
                    >
                      Löschen
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xl font-semibold text-emerald-950">
                  Frage bearbeiten
                </div>
                <div className="text-sm text-emerald-800">
                  {selectedQuestionnaire
                    ? label(selectedQuestionnaire.title, 70)
                    : ""}
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-emerald-900 underline"
                disabled={busy}
              >
                Schließen
              </button>
            </div>

            {editLoading ? (
              <div className="text-emerald-900">Lade Optionen…</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-emerald-900 font-semibold mb-2">
                    Fragetext
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2"
                    rows={3}
                    disabled={busy}
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="text-emerald-900 font-semibold min-w-48">
                    Anzahl Optionen
                  </div>
                  <select
                    value={editOptionCount}
                    onChange={(e) =>
                      onChangeOptionCount(Number(e.target.value))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    disabled={busy}
                  >
                    {Array.from(
                      { length: MAX_OPTIONS - MIN_OPTIONS + 1 },
                      (_, i) => i + MIN_OPTIONS
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-emerald-900 font-semibold mb-2">
                    Optionen
                  </div>
                  <div className="space-y-2">
                    {editOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => updateEditOption(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2"
                        placeholder={`Option ${idx + 1}…`}
                        disabled={busy}
                      />
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-emerald-800">
                    Hinweis: Optionen werden nach Position gespeichert,{" "}
                    <code className="px-1 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                      value
                    </code>{" "}
                    = Text.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-full border border-slate-200 text-emerald-900 font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={busy}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={saveQuestionAndOptions}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>
  );
}
