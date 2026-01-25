/**
 * Fragen & Antworten – FAQ Seite
 *
 * Hinweis:
 * - Inhalte sind aktuell statisch (hard-coded)
 * - Das Team möchte später evtl. dynamische FAQs (z. B. aus Supabase oder JSON)
 * - Dieser Aufbau dient als Startversion / Platzhalter
 */

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold text-emerald-900">
        Häufige Fragen und Antworten
      </h1>

      <p className="text-base text-slate-800">
        Hier finden Sie Antworten auf häufige Fragen zur Nutzung der WebApp. Die
        Inhalte sind noch im Aufbau.
      </p>

      <div className="space-y-4">
        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Wie kann ich mich schneller orientieren?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Nutzen Sie die Hauptnavigation oben auf der Seite. Die Inhalte sind
            thematisch in die Bereiche „Informationen“ und „Entscheidungen“
            gegliedert.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Was bedeutet der Bereich „Informationen“?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Im Bereich „Informationen“ finden Sie medizinische und
            unterstützende Inhalte, zum Beispiel zu Therapien, Nebenwirkungen,
            Unterstützungsangeboten und weiterführenden Informationsquellen.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Wo finde ich Informationen zu bestimmten Therapien?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Informationen zu Therapien finden Sie im Bereich „Informationen“.
            Dort sind die Inhalte thematisch gegliedert.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Wofür ist der Bereich „Entscheidungen“ gedacht?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Der Bereich „Entscheidungen“ unterstützt Sie dabei, wichtige
            Entscheidungen rund um Ihre Behandlung vorzubereiten. Dort finden
            Sie Fragen für das Arztgespräch, Entscheidungshilfen und Fragebögen.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Wie gelange ich zu den Fragebögen?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Öffnen Sie im Menü den Bereich „Entscheidungen“. Dort stehen Ihnen
            die Fragebögen zur Verfügung.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Kann ich die WebApp auch auf dem Smartphone nutzen?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Ja, die WebApp ist für verschiedene Bildschirmgrößen optimiert und
            kann auf allen Geräten genutzt werden.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            An wen kann ich mich wenden, wenn ich technische Probleme habe?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Wenn Probleme auftreten, wenden Sie sich bitte an die betreuende
            Klinik oder das Projektteam, das Ihnen den Zugang zur WebApp
            bereitgestellt hat.
          </p>
        </details>
      </div>
    </div>
  );
}
