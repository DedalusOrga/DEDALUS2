// app/src/pages/FragebogenErgebnis.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
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

type Category = "niedrig" | "mittel" | "hoch";

type RecommendationRow = {
  questionnaire_id: string;
  category: Category;
  body_md: string;
  status: string;
};

function categoryFromRatio(ratio: number): Category {
  if (ratio < 0.34) return "niedrig";
  if (ratio < 0.67) return "mittel";
  return "hoch";
}

const DEFAULT_INTRO =
  "Auf Basis Ihrer Antworten sehen Sie hier eine kurze Empfehlung.";

const DEFAULT_FALLBACK_TEXTS: Record<Category, string> = {
  niedrig: `
### Empfehlung
Ihr Ergebnis liegt im **niedrigen Bereich**. In diesem Themenfeld sind vermutlich noch Fragen offen.

**Nächste Schritte:**
- Notieren Sie 2–3 Fragen für das Arztgespräch.
- Lassen Sie Optionen und nächste Schritte konkret erklären.
- Bitten Sie um eine kurze Zusammenfassung.
`,
  mittel: `
### Empfehlung
Ihr Ergebnis liegt im **mittleren Bereich**. Sie haben bereits Orientierung, aber vermutlich sind noch einzelne Punkte unklar.

**Nächste Schritte:**
- Priorisieren Sie Ihre wichtigsten Themen.
- Klären Sie Vor- und Nachteile der Optionen.
- Prüfen Sie, welche Informationen noch fehlen.
`,
  hoch: `
### Empfehlung
Ihr Ergebnis liegt im **hohen Bereich**. Das deutet darauf hin, dass Sie in diesem Themenfeld gut orientiert sind.

**Nächste Schritte:**
- Formulieren Sie Ihre Prioritäten klar.
- Lassen Sie einen konkreten Plan festhalten.
- Prüfen Sie regelmäßig, ob sich Ziele oder Bedürfnisse verändern.
`,
};

export default function FragebogenErgebnis() {
  const { id: code } = useParams();
  const navigate = useNavigate();

  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingReco, setLoadingReco] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null,
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);

  // Empfehlungstext aus DB
  const [recommendationMdFromDb, setRecommendationMdFromDb] = useState<
    string | null
  >(null);
  const [recommendationWarning, setRecommendationWarning] = useState<
    string | null
  >(null);

  // 1) Basisdaten laden (Fragebogen, Fragen, Optionen, Antworten)
  useEffect(() => {
    const loadBase = async () => {
      try {
        setLoadingBase(true);
        setError(null);
        setRecommendationWarning(null);
        setRecommendationMdFromDb(null);

        if (!code) throw new Error("Kein Fragebogen-Code in der URL.");

        const userRes = await supabase.auth.getUser();
        const userId = userRes.data.user?.id;
        if (!userId) throw new Error("Nicht eingeloggt.");

        // Fragebogen
        const qRes = await supabase
          .from("questionnaires")
          .select("id, code, title, description")
          .eq("code", code)
          .single();

        if (qRes.error) throw qRes.error;
        setQuestionnaire(qRes.data);

        // Fragen
        const questionsRes = await supabase
          .from("questions")
          .select("id, position, text")
          .eq("questionnaire_id", qRes.data.id)
          .eq("is_active", true)
          .order("position", { ascending: true });

        if (questionsRes.error) throw questionsRes.error;
        const qs = questionsRes.data ?? [];
        setQuestions(qs);

        // Optionen
        const questionIds = qs.map((x) => x.id);
        let opts: Option[] = [];
        if (questionIds.length > 0) {
          const optsRes = await supabase
            .from("question_options")
            .select("id, question_id, position, text")
            .in("question_id", questionIds)
            .order("position", { ascending: true });

          if (optsRes.error) throw optsRes.error;
          opts = optsRes.data ?? [];
        }
        setOptions(opts);

        // Session finden
        const sFind = await supabase
          .from("questionnaire_sessions")
          .select("id")
          .eq("user_id", userId)
          .eq("questionnaire_id", qRes.data.id)
          .maybeSingle();

        if (sFind.error) throw sFind.error;
        const sid = sFind.data?.id;
        if (!sid) throw new Error("Keine Session gefunden.");

        // Antworten
        const aRes = await supabase
          .from("answers")
          .select("question_id, option_id")
          .eq("session_id", sid);

        if (aRes.error) throw aRes.error;
        setAnswers(aRes.data ?? []);

        setLoadingBase(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unbekannter Fehler");
        setLoadingBase(false);
      }
    };

    void loadBase();
  }, [code]);

  const optionById = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(o.id, o);
    return m;
  }, [options]);

  // 2) Kategorie berechnen
  const category: Category = useMemo(() => {
    // Summe der gewählten Option.position
    let score = 0;
    for (const a of answers) {
      const opt = optionById.get(a.option_id);
      if (opt) score += opt.position;
    }

    // Max pro Frage ermitteln
    const maxPerQuestion = new Map<string, number>();
    for (const o of options) {
      const current = maxPerQuestion.get(o.question_id) ?? 0;
      if (o.position > current) maxPerQuestion.set(o.question_id, o.position);
    }

    let maxScore = 0;
    for (const q of questions) {
      maxScore += maxPerQuestion.get(q.id) ?? 0;
    }

    const ratio = maxScore > 0 ? score / maxScore : 0;
    return categoryFromRatio(ratio);
  }, [answers, optionById, options, questions]);

  // 3) Empfehlungstext aus questionnaire_recommendations laden
  useEffect(() => {
    const loadRecommendation = async () => {
      const qid = questionnaire?.id;
      if (!qid) return;

      try {
        setLoadingReco(true);
        setRecommendationWarning(null);
        setRecommendationMdFromDb(null);

        const res = await supabase
          .from("questionnaire_recommendations")
          .select("questionnaire_id, category, body_md, status")
          .eq("questionnaire_id", qid)
          .eq("category", category)
          .eq("status", "published")
          .maybeSingle<RecommendationRow>();

        if (res.error) throw res.error;

        const md = res.data?.body_md?.trim();
        if (!md) {
          setRecommendationWarning(
            "Kein Empfehlungstext in der Datenbank gefunden. Es wird ein Standardtext angezeigt.",
          );
          setRecommendationMdFromDb(null);
        } else {
          setRecommendationMdFromDb(md);
        }
      } catch (e: unknown) {
        setRecommendationWarning(
          `Empfehlungstext konnte nicht aus der Datenbank geladen werden. Es wird ein Standardtext angezeigt.`,
        );
        setRecommendationMdFromDb(null);
      } finally {
        setLoadingReco(false);
      }
    };

    // erst laden, wenn Basisdaten da sind
    if (!loadingBase && questionnaire?.id) {
      void loadRecommendation();
    }
  }, [category, questionnaire?.id, loadingBase]);

  const isLoading = loadingBase || loadingReco;

  const pageTitle = useMemo(() => {
    return questionnaire?.title ?? "Ergebnis";
  }, [questionnaire?.title]);

  const recommendationMarkdown = useMemo(() => {
    return recommendationMdFromDb ?? DEFAULT_FALLBACK_TEXTS[category];
  }, [recommendationMdFromDb, category]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10 text-emerald-900">
        Lade Ergebnis…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
        <p className="text-red-700 mb-4">Fehler: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-900 underline"
        >
          Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      {/* Zurück */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-emerald-900 mb-10"
      >
        <span className="text-2xl mr-2">←</span> Zurück
      </button>

      {/* Ergebnis-Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md p-8 md:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-emerald-900">
            {pageTitle}
          </h1>
          <p className="text-emerald-800 mt-2">{DEFAULT_INTRO}</p>

          {recommendationWarning && (
            <p className="text-amber-700 mt-3 text-sm">
              Hinweis: {recommendationWarning}
            </p>
          )}
        </div>

        {/* Empfehlungstext */}
        <div className="prose prose-emerald max-w-none">
          <ReactMarkdown>{recommendationMarkdown}</ReactMarkdown>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={() => navigate("/entscheidungen/frageboegen")}
            className="bg-emerald-100 text-emerald-900 px-6 py-3 rounded-full font-semibold hover:bg-emerald-200"
          >
            Zur Übersicht
          </button>

          <button
            onClick={() =>
              navigate(
                `/entscheidungen/fragebogen/${questionnaire?.code ?? code}`,
              )
            }
            className="bg-emerald-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-800"
          >
            Fragebogen erneut ansehen
          </button>
        </div>
      </div>
    </div>
  );
}
