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

type RecommendationTexts = Record<Category, string>;

type QuestionnaireResultConfig = {
  titleOverride?: string;
  intro?: string;
  texts: RecommendationTexts;
};

function categoryFromRatio(ratio: number): Category {
  if (ratio < 0.34) return "niedrig";
  if (ratio < 0.67) return "mittel";
  return "hoch";
}

const RESULT_TEXTS_BY_CODE: Record<string, QuestionnaireResultConfig> = {
  fb1: {
    titleOverride: "Was möchte ich mit der Behandlung erreichen?",
    intro:
      "Auf Basis Ihrer Antworten sehen Sie hier eine kurze, verständliche Empfehlung.",
    texts: {
      niedrig: `
### Empfehlung
Ihre Antworten zeigen, dass Ihre Ziele mit der Behandlung noch nicht ganz klar sind.

**Nächste Schritte:**
- Überlegen Sie, was Ihnen persönlich am wichtigsten ist.
- Notieren Sie 1–2 Ziele für das nächste Gespräch.
- Fragen Sie gezielt nach, welche Behandlung diese Ziele unterstützen kann.

> Tipp: Ziele dürfen sich ändern – wichtig ist, dass Sie gemeinsam starten.
`,
      mittel: `
### Empfehlung
Ihre Antworten zeigen, dass Sie einige Ziele bereits benennen können, andere aber noch offen sind.

**Hilfreich kann sein:**
- Priorisieren Sie Ihre wichtigsten Ziele.
- Klären Sie, welche Ziele realistisch erreichbar sind.
- Besprechen Sie mögliche Zielkonflikte.

> Tipp: Fragen Sie: „Woran merken wir, dass die Behandlung wirkt?“
`,
      hoch: `
### Empfehlung
Ihre Antworten zeigen, dass Sie sehr klar wissen, was Sie mit der Behandlung erreichen möchten.

**So bleiben Sie gut vorbereitet:**
- Kommunizieren Sie Ihre Ziele aktiv.
- Fragen Sie nach einem konkreten Behandlungsplan.
- Prüfen Sie regelmäßig, ob Ihre Ziele noch passen.

> Tipp: Eine kurze Notizliste vor dem Termin hilft, nichts zu vergessen.
`,
    },
  },

  fb2: {
    titleOverride: "Wie möchte ich bei Entscheidungen mitwirken?",
    intro:
      "Hier finden Sie eine Empfehlung, wie Sie Ihre Rolle im Entscheidungsprozess gut gestalten können.",
    texts: {
      niedrig: `
### Empfehlung
Ihre Antworten deuten darauf hin, dass Sie sich bisher eher zurückhaltend in Entscheidungen einbringen.

**Mögliche nächste Schritte:**
- Notieren Sie offene Fragen.
- Bitten Sie um verständliche Erklärungen.
- Nehmen Sie ggf. eine Vertrauensperson mit.

> Tipp: Es ist völlig in Ordnung, nachzufragen oder um Bedenkzeit zu bitten.
`,
      mittel: `
### Empfehlung
Sie bringen sich teilweise in Entscheidungen ein, wünschen sich aber noch mehr Sicherheit.

**Das kann helfen:**
- Klären Sie Vor- und Nachteile der Optionen.
- Fragen Sie nach Alternativen.
- Bitten Sie um Bedenkzeit und eine kurze Zusammenfassung.

> Tipp: Fragen Sie: „Was bedeutet das konkret für meinen Alltag?“
`,
      hoch: `
### Empfehlung
Sie beteiligen sich aktiv an Entscheidungen und kennen Ihre Rolle gut.

**So nutzen Sie das:**
- Formulieren Sie Ihre Präferenzen klar („Mir ist wichtig, dass …“).
- Lassen Sie Optionen an Ihren Prioritäten messen.
- Vereinbaren Sie klare nächste Schritte.

> Tipp: Eine schriftliche Notiz der nächsten Schritte schafft Sicherheit.
`,
    },
  },

  fb3: {
    titleOverride: "Was beeinflusst meine Entscheidungen?",
    intro:
      "Diese Empfehlung hilft Ihnen, Einflussfaktoren besser einzuordnen und gezielt anzusprechen.",
    texts: {
      niedrig: `
### Empfehlung
Einflussfaktoren auf Ihre Entscheidungen sind Ihnen noch nicht vollständig bewusst.

**Hilfreich kann sein:**
- Reflektieren Sie persönliche Werte, Sorgen und Erwartungen.
- Sprechen Sie Unsicherheiten offen an.
- Bitten Sie um strukturierte Entscheidungsübersichten.

> Tipp: Es hilft, wenn Sie 1–2 Punkte benennen, die Ihnen besonders Angst machen oder wichtig sind.
`,
      mittel: `
### Empfehlung
Sie erkennen mehrere Einflussfaktoren, aber nicht alle sind klar priorisiert.

**Nächste Schritte:**
- Ordnen Sie Ihre Einflussfaktoren nach Wichtigkeit.
- Klären Sie Zielkonflikte (z. B. Wirksamkeit vs. Nebenwirkungen).
- Fragen Sie nach, welche Option am besten zu Ihren Prioritäten passt.

> Tipp: Eine „Top 3“-Liste reicht oft schon.
`,
      hoch: `
### Empfehlung
Sie haben ein gutes Verständnis dafür, was Ihre Entscheidungen beeinflusst.

**So bleiben Sie handlungsfähig:**
- Benennen Sie diese Faktoren klar im Gespräch.
- Nutzen Sie sie aktiv beim Abwägen.
- Prüfen Sie regelmäßig, ob sich Ihre Prioritäten verändern.

> Tipp: Wenn sich etwas ändert, ist eine Therapieanpassung oft möglich – fragen Sie nach dem Vorgehen.
`,
    },
  },

  fb4: {
    titleOverride: "Wie werden Entscheidungen bei Krankheiten getroffen?",
    intro:
      "Hier finden Sie eine kurze Empfehlung, wie Sie den Entscheidungsprozess besser verstehen und nutzen können.",
    texts: {
      niedrig: `
### Empfehlung
Der Entscheidungsprozess ist für Sie noch nicht ganz transparent.

**Das kann helfen:**
- Fragen Sie nach dem Ablauf: „Wie treffen wir die Entscheidung Schritt für Schritt?“
- Bitten Sie um einfache Erklärungen von Begriffen und Optionen.
- Lassen Sie sich Alternativen nennen.

> Tipp: Fragen Sie nach einer kurzen Zusammenfassung am Ende des Gesprächs.
`,
      mittel: `
### Empfehlung
Sie verstehen Teile des Entscheidungsprozesses, wünschen sich aber mehr Klarheit.

**Hilfreich:**
- Lassen Sie sich die nächsten Schritte erklären (Diagnostik, Abwägung, Entscheidung).
- Fragen Sie, wie Sie sich konkret einbringen können.
- Bitten Sie um Bedenkzeit, wenn Sie sie brauchen.

> Tipp: „Welche Informationen fehlen noch, bevor wir entscheiden?“ ist oft eine gute Frage.
`,
      hoch: `
### Empfehlung
Sie haben ein gutes Verständnis davon, wie Entscheidungen getroffen werden.

**So bleiben Sie informiert:**
- Fragen Sie gezielt nach Ihrer Rolle und nach Alternativen.
- Klären Sie, wann eine Neubewertung sinnvoll ist.
- Vereinbaren Sie klare Follow-ups.

> Tipp: Notieren Sie sich offene Fragen direkt während des Gesprächs.
`,
    },
  },

  fb5: {
    titleOverride: "Was ist mir während der Behandlungsphase wichtig?",
    intro:
      "Diese Empfehlung unterstützt Sie dabei, Prioritäten in der Behandlungsphase klar zu benennen.",
    texts: {
      niedrig: `
### Empfehlung
Ihre Prioritäten in der Behandlungsphase sind noch nicht klar definiert.

**Mögliche Schritte:**
- Überlegen Sie, was Sie im Alltag entlastet (Termine, Wege, Unterstützung).
- Sprechen Sie über Bedürfnisse (Schlaf, Ernährung, Bewegung, psychische Belastung).
- Fragen Sie nach Unterstützungsangeboten (Beratung, Sozialdienst, Gruppen).

> Tipp: Es hilft, wenn Sie eine Sache nennen, die Ihnen aktuell am meisten fehlt oder schwerfällt.
`,
      mittel: `
### Empfehlung
Sie haben mehrere Prioritäten, aber noch keine klare Reihenfolge.

**Hilfreich:**
- Priorisieren Sie 2–3 Punkte, die jetzt am wichtigsten sind.
- Besprechen Sie diese mit dem Behandlungsteam.
- Klären Sie, welche Maßnahmen Ihnen konkret helfen können.

> Tipp: Konkrete Wünsche („Ich brauche …“) sind leichter umzusetzen als allgemeine.
`,
      hoch: `
### Empfehlung
Ihre Prioritäten sind klar und gut reflektiert.

**So nutzen Sie das:**
- Kommunizieren Sie Ihre Prioritäten aktiv im Team.
- Prüfen Sie regelmäßig, ob sich etwas verändert.
- Legen Sie fest, wann Sie Unterstützung brauchen und wen Sie ansprechen.

> Tipp: Ein gutes Unterstützungsnetz kann die Lebensqualität spürbar verbessern.
`,
    },
  },
};

const DEFAULT_CONFIG: QuestionnaireResultConfig = {
  titleOverride: "Ergebnis",
  intro: "Auf Basis Ihrer Antworten sehen Sie hier eine kurze Empfehlung.",
  texts: {
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
  },
};

export default function FragebogenErgebnis() {
  const { id: code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null,
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

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

        setLoading(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unbekannter Fehler");
        setLoading(false);
      }
    };

    void load();
  }, [code]);

  const optionById = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(o.id, o);
    return m;
  }, [options]);

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

  const cfg = useMemo(() => {
    const key = questionnaire?.code ?? code ?? "";
    return RESULT_TEXTS_BY_CODE[key] ?? DEFAULT_CONFIG;
  }, [questionnaire?.code, code]);

  const pageTitle = useMemo(() => {
    if (cfg.titleOverride) return cfg.titleOverride;
    return questionnaire?.title ?? "Ergebnis";
  }, [cfg.titleOverride, questionnaire?.title]);

  const intro = cfg.intro ?? DEFAULT_CONFIG.intro;

  const recommendationMarkdown = useMemo(() => {
    return cfg.texts[category];
  }, [cfg, category]);

  if (loading) {
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
          {intro && <p className="text-emerald-800 mt-2">{intro}</p>}
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
