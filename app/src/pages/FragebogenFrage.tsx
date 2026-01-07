import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

type Questionnaire = {
  id: string;
  code: string;
  title: string;
  description: string | null;
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
};

type AnswerRow = {
  question_id: string;
  option_id: string;
};

export default function FragebogenFrage() {
  const { id: code } = useParams(); // z.B. fb1
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // Local state: pro Frage die gewählte Option
  const [selectedByQuestion, setSelectedByQuestion] = useState<
    Record<string, string>
  >({});

  const [current, setCurrent] = useState(0);

  const currentQuestion = questions[current];
  const lastQuestion = current === questions.length - 1;

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
          .select("id, code, title, description")
          .eq("code", code)
          .single();

        if (qRes.error) throw qRes.error;
        setQuestionnaire(qRes.data);

        // 2) Fragen holen
        const questionsRes = await supabase
          .from("questions")
          .select("id, position, text")
          .eq("questionnaire_id", qRes.data.id)
          .eq("is_active", true)
          .order("position", { ascending: true });

        if (questionsRes.error) throw questionsRes.error;
        setQuestions(questionsRes.data ?? []);

        // 3) Optionen holen (für alle Fragen in einem Rutsch)
        const questionIds = (questionsRes.data ?? []).map((x) => x.id);
        if (questionIds.length > 0) {
          const optsRes = await supabase
            .from("question_options")
            .select("id, question_id, position, text")
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

        // Versuch: Session finden
        const sFind = await supabase
          .from("questionnaire_sessions")
          .select("id")
          .eq("user_id", userId)
          .eq("questionnaire_id", qRes.data.id)
          .maybeSingle();

        if (sFind.error) throw sFind.error;

        let sid = sFind.data?.id ?? null;

        // Wenn keine Session existiert: anlegen
        if (!sid) {
          const sCreate = await supabase
            .from("questionnaire_sessions")
            .insert({
              user_id: userId,
              questionnaire_id: qRes.data.id,
              status: "in_progress",
              current_position: 1,
            })
            .select("id")
            .single();

          if (sCreate.error) throw sCreate.error;
          sid = sCreate.data.id;
        }

        setSessionId(sid);

        // 5) Vorhandene Antworten laden (für Checked-State)
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

  const back = () => {
    if (current === 0) navigate("/entscheidungen/frageboegen-entscheidung");
    else setCurrent((c) => c - 1);
  };

  const next = async () => {
    if (!currentQuestion) return;

    // optional: Fortschritt in Session aktualisieren
    if (sessionId) {
      await supabase
        .from("questionnaire_sessions")
        .update({
          current_position: Math.min(current + 2, questions.length),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    if (lastQuestion) navigate(`/entscheidungen/fragebogen/${code}/fertig`);
    else setCurrent((c) => c + 1);
  };

  const onSelect = async (questionId: string, optionId: string) => {
    if (!sessionId) return;

    // UI sofort aktualisieren
    setSelectedByQuestion((prev) => ({ ...prev, [questionId]: optionId }));

    // DB: upsert (unique: session_id + question_id)
    const { error } = await supabase.from("answers").upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        option_id: optionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: "session_id,question_id" }
    );

    if (error) setError(error.message);
  };

  const restart = async () => {
    if (!sessionId) return;
    // Du wolltest: alte Session darf gelöscht werden → answers werden via CASCADE mitgelöscht
    const { error } = await supabase
      .from("questionnaire_sessions")
      .delete()
      .eq("id", sessionId);
    if (error) {
      setError(error.message);
      return;
    }
    // Einfach neu laden
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

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      <button
        onClick={back}
        className="flex items-center text-emerald-900 mb-6 cursor-pointer"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      <h1 className="text-emerald-900 text-3xl font-semibold mb-2">
        {questionnaire.title}
      </h1>

      <p className="text-emerald-800 mb-6 text-lg">
        Frage {current + 1} von {questions.length}
      </p>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <p className="text-lg text-emerald-900 mb-6 leading-relaxed">
          {currentQuestion?.text}
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

        {lastQuestion ? (
          <button
            onClick={next}
            className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold"
          >
            Fragebogen abschließen
          </button>
        ) : (
          <button
            onClick={next}
            className="text-emerald-900 hover:text-emerald-700 text-lg font-medium flex items-center gap-2 pr-2"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}
