import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../infrastructure/supabase/client";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
  description: string | null;
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
  position: number;
  text: string;
  next_question_id: string | null;
};

type AnswerRow = {
  question_id: string;
  option_id: string;
};

export default function FragebogenFrage() {
  const { id: code } = useParams(); // z.B. fb1
  const navigate = useNavigate();

  const [showSelectHint, setShowSelectHint] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null,
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // pro Frage die gewählte Option
  const [selectedByQuestion, setSelectedByQuestion] = useState<
    Record<string, string>
  >({});

  // aktuelle Frage + History für "Vorherige Frage"
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );
  const [history, setHistory] = useState<string[]>([]);

  const currentQuestion = useMemo(
    () => questions.find((q) => q.id === currentQuestionId) ?? null,
    [questions, currentQuestionId],
  );

  const optionsForCurrent = useMemo(() => {
    if (!currentQuestion) return [];
    return options
      .filter((o) => o.question_id === currentQuestion.id)
      .sort((a, b) => a.position - b.position);
  }, [options, currentQuestion]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!code) throw new Error("Kein Fragebogen-Code in der URL.");

        // 1) Fragebogen holen
        const qRes = await supabase
          .from("questionnaires")
          .select("id, code, title, description, start_question_id")
          .eq("code", code)
          .single();

        if (qRes.error) throw qRes.error;
        setQuestionnaire(qRes.data);

        // Wenn keine Startfrage gesetzt ist -> in Bearbeitung
        if (!qRes.data.start_question_id) {
          setQuestions([]);
          setOptions([]);
          setSessionId(null);
          setSelectedByQuestion({});
          setCurrentQuestionId(null);
          setHistory([]);
          setLoading(false);
          return;
        }

        // 2) Fragen holen
        const questionsRes = await supabase
          .from("questions")
          .select("id, position, text")
          .eq("questionnaire_id", qRes.data.id)
          .eq("is_active", true)
          .order("position", { ascending: true });

        if (questionsRes.error) throw questionsRes.error;
        const loadedQuestions = questionsRes.data ?? [];
        setQuestions(loadedQuestions);

        // 3) Optionen holen (inkl. next_question_id)
        const questionIds = loadedQuestions.map((x) => x.id);
        if (questionIds.length > 0) {
          const optsRes = await supabase
            .from("question_options")
            .select("id, question_id, position, text, next_question_id")
            .in("question_id", questionIds)
            .order("position", { ascending: true });

          if (optsRes.error) throw optsRes.error;
          setOptions(optsRes.data ?? []);
        } else {
          setOptions([]);
        }

        // 4) Session get-or-create
        const userRes = await supabase.auth.getUser();
        const userId = userRes.data.user?.id;
        if (!userId) throw new Error("Nicht eingeloggt.");

        const sFind = await supabase
          .from("questionnaire_sessions")
          .select("id")
          .eq("user_id", userId)
          .eq("questionnaire_id", qRes.data.id)
          .maybeSingle();

        if (sFind.error) throw sFind.error;

        let sid = sFind.data?.id ?? null;

        if (!sid) {
          const sCreate = await supabase
            .from("questionnaire_sessions")
            .insert({
              user_id: userId,
              questionnaire_id: qRes.data.id,
              status: "in_progress",
              current_position: 1, // legacy
            })
            .select("id")
            .single();

          if (sCreate.error) throw sCreate.error;
          sid = sCreate.data.id;
        }

        setSessionId(sid);

        // 5) Vorhandene Antworten laden
        const aRes = await supabase
          .from("answers")
          .select("question_id, option_id")
          .eq("session_id", sid);

        if (aRes.error) throw aRes.error;

        const map: Record<string, string> = {};
        (aRes.data ?? []).forEach((a: AnswerRow) => {
          map[a.question_id] = a.option_id;
        });
        setSelectedByQuestion(map);

        // 6) Startfrage setzen
        setCurrentQuestionId(qRes.data.start_question_id);
        setHistory([]);
        setShowSelectHint(false);

        setLoading(false);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unbekannter Fehler");
        }
        setLoading(false);
      }
    };

    loadAll();
  }, [code]);

  const backQuestion = () => {
    const prev = history[history.length - 1];
    if (!prev) return;

    setHistory((h) => h.slice(0, -1));
    setCurrentQuestionId(prev);
    setShowSelectHint(false);
  };

  const next = async () => {
    if (!currentQuestion) return;

    const selectedOptionId = selectedByQuestion[currentQuestion.id];

    // Keine Auswahl -> Hinweis zeigen, aber nicht weitergehen
    if (!selectedOptionId) {
      setShowSelectHint(true);
      return;
    }

    // Ab hier: Erfolgspfad -> Hinweis sicher ausblenden
    setShowSelectHint(false);

    const selectedOpt = options.find((o) => o.id === selectedOptionId);
    if (!selectedOpt) {
      setError("Ausgewählte Option wurde nicht gefunden.");
      return;
    }

    const nextId = selectedOpt.next_question_id;

    // optional: Fortschritt speichern (nur updated_at)
    if (sessionId) {
      await supabase
        .from("questionnaire_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);
    }

    // Ende
    if (!nextId) {
      navigate(`/entscheidungen/fragebogen/${code}/fertig`);
      return;
    }

    // History push + zur nächsten Frage
    setHistory((h) => [...h, currentQuestion.id]);
    setCurrentQuestionId(nextId);
  };

  const onSelect = async (questionId: string, optionId: string) => {
    if (!sessionId) return;

    // UI sofort aktualisieren
    setSelectedByQuestion((prev) => ({ ...prev, [questionId]: optionId }));
    setShowSelectHint(false);

    // DB speichern
    const { error } = await supabase.from("answers").upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        option_id: optionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: "session_id,question_id" },
    );

    if (error) setError(error.message);
  };

  const restart = async () => {
    if (!sessionId) return;

    const { error } = await supabase
      .from("questionnaire_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10 text-emerald-900">
        Lade...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
        <p className="text-red-700 mb-4">Fehler: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-emerald-900 underline"
        >
          Neu laden
        </button>
      </div>
    );
  }

  if (!questionnaire) return null;

  // In Bearbeitung
  if (!questionnaire.start_question_id) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
        <button
          onClick={() => navigate("/entscheidungen/frageboegen")}
          className="flex items-center text-emerald-900 mb-6 cursor-pointer"
        >
          ← Zur Übersicht
        </button>

        <div className="bg-white rounded-3xl shadow-md p-6">
          <h1 className="text-emerald-900 text-2xl font-semibold mb-2">
            {questionnaire.title}
          </h1>
          <p className="text-emerald-900">
            Dieser Fragebogen befindet sich noch in Bearbeitung.
          </p>
        </div>
      </div>
    );
  }

  // Guard: Routing kaputt
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
        <button
          onClick={() => navigate("/entscheidungen/frageboegen")}
          className="flex items-center text-emerald-900 mb-6 cursor-pointer"
        >
          ← Zur Übersicht
        </button>

        <div className="bg-white rounded-3xl shadow-md p-6">
          <h1 className="text-emerald-900 text-2xl font-semibold mb-2">
            {questionnaire.title}
          </h1>
          <p className="text-red-700">
            Fehler: Start- oder Routing-Konfiguration ist ungültig.
          </p>
        </div>
      </div>
    );
  }

  const step = history.length + 1;

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      <button
        onClick={() => navigate("/entscheidungen/frageboegen")}
        className="flex items-center text-emerald-900 mb-6 cursor-pointer"
      >
        ← Zur Übersicht
      </button>

      <h1 className="text-emerald-900 text-3xl font-semibold mb-2">
        {questionnaire.title}
      </h1>

      <p className="text-emerald-800 mb-6 text-lg">Frage {step}</p>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <p className="text-lg text-emerald-900 mb-6 leading-relaxed">
          {currentQuestion.text}
        </p>

        <div className="flex flex-col gap-4">
          {optionsForCurrent.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name={currentQuestion.id}
                checked={selectedByQuestion[currentQuestion.id] === opt.id}
                onChange={() => onSelect(currentQuestion.id, opt.id)}
              />
              <span className="text-emerald-900">{opt.text}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={restart} className="text-emerald-900 underline">
          Neu starten
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={backQuestion}
            disabled={history.length === 0}
            className="text-emerald-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vorherige Frage
          </button>

          {showSelectHint && (
            <div className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-900 text-sm">
              Bitte wähle eine Option aus, um fortzufahren.
            </div>
          )}

          <button
            onClick={next}
            className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  );
}
