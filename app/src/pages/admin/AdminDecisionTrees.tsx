import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/supabase/client";
import { useAuth } from "../../hooks/AuthProvider";
import AdminLayout from "../../components/AdminLayout";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
  start_question_id: string | null;
};

type Question = {
  id: string;
  position: number;
  text: string;
};

type Option = {
  id: string;
  question_id: string;
  next_question_id: string | null;
};

// Kurzer Label-Text aus DB-Feld (kein extra title-Feld nötig)
function label(text: string, max = 60) {
  const t = (text ?? "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export default function AdminDecisionTrees() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Tabs active
  const isQuestions = location.pathname.startsWith("/admin/questions");
  const isTrees = location.pathname.startsWith("/admin/decision-trees");
  const isContent = !isQuestions && !isTrees; // default /admin

  const tabBase = "px-5 py-2 rounded-full text-sm font-semibold transition";
  const tabActive = "bg-emerald-900 text-white";
  const tabInactive = "text-emerald-900 hover:bg-emerald-50";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQId, setSelectedQId] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((q) => q.id === selectedQId) ?? null,
    [questionnaires, selectedQId],
  );

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  );

  const nextTargets = useMemo(() => {
    if (!selectedQuestionId) return questions;
    return questions.filter((q) => q.id !== selectedQuestionId);
  }, [questions, selectedQuestionId]);

  // aktuelles Ziel (wir lesen den Wert der ersten Option dieser Frage;
  // beim Speichern wird es für ALLE Optionen vereinheitlicht)
  const currentNextForQuestion = useMemo(() => {
    if (!selectedQuestionId) return "";
    const first = options.find((o) => o.question_id === selectedQuestionId);
    return first?.next_question_id ?? "";
  }, [options, selectedQuestionId]);

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  // Fragebögen laden
  useEffect(() => {
    const loadQuestionnaires = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("questionnaires")
        .select("id, code, title, start_question_id")
        .order("code", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const list = (data ?? []) as Questionnaire[];
      setQuestionnaires(list);

      if (!selectedQId && list.length > 0) {
        setSelectedQId(list[0].id);
      }

      setLoading(false);
    };

    loadQuestionnaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fragen + Optionen laden, sobald Fragebogen gewählt
  useEffect(() => {
    const loadQuestionsAndOptions = async () => {
      if (!selectedQId) return;

      setLoading(true);
      setError(null);

      const qRes = await supabase
        .from("questions")
        .select("id, position, text")
        .eq("questionnaire_id", selectedQId)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (qRes.error) {
        setError(qRes.error.message);
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
        setError(oRes.error.message);
        setLoading(false);
        return;
      }

      setOptions((oRes.data ?? []) as Option[]);

      setSelectedQuestionId((prev) => {
        if (prev && qs.some((q) => q.id === prev)) return prev;
        return qs[0]?.id ?? "";
      });

      setLoading(false);
    };

    loadQuestionsAndOptions();
  }, [selectedQId]);

  async function saveStartQuestion(startQuestionId: string | null) {
    if (!selectedQId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("questionnaires")
      .update({ start_question_id: startQuestionId })
      .eq("id", selectedQId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === selectedQId ? { ...q, start_question_id: startQuestionId } : q,
      ),
    );

    setSaving(false);
  }

  async function saveNextForQuestion(nextQuestionId: string | null) {
    if (!selectedQuestionId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("question_options")
      .update({ next_question_id: nextQuestionId })
      .eq("question_id", selectedQuestionId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setOptions((prev) =>
      prev.map((o) =>
        o.question_id === selectedQuestionId
          ? { ...o, next_question_id: nextQuestionId }
          : o,
      ),
    );

    setSaving(false);
  }

  return (
    <AdminLayout title="Admin – Fragebogen-Routing">
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

      {/* Fragebogen + Startfrage */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <label className="text-emerald-900 font-semibold min-w-40">
            Fragebogen
          </label>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={selectedQId}
            onChange={(e) => setSelectedQId(e.target.value)}
            disabled={loading}
          >
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {label(q.title, 60)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <label className="text-emerald-900 font-semibold min-w-40">
            Startfrage
          </label>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={selectedQuestionnaire?.start_question_id ?? ""}
            onChange={(e) => saveStartQuestion(e.target.value || null)}
            disabled={loading || saving || !selectedQuestionnaire}
          >
            <option value="">— keine Startfrage —</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {label(q.text, 70)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Links: Fragen, Rechts: Nächste Frage */}
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
                  >
                    <div className="text-emerald-900">{label(q.text, 90)}</div>
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
            {selectedQuestion
              ? `Für: “${label(selectedQuestion.text, 60)}”`
              : "Wähle links eine Frage."}
          </p>

          {!selectedQuestionId ? (
            <p className="text-emerald-900">Keine Frage ausgewählt.</p>
          ) : (
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 w-full"
              value={currentNextForQuestion}
              onChange={(e) => saveNextForQuestion(e.target.value || null)}
              disabled={loading || saving}
            >
              <option value="">— Ende (Fragebogen abschließen) —</option>
              {nextTargets.map((q) => (
                <option key={q.id} value={q.id}>
                  {label(q.text, 70)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
