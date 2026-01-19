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
            Wie melde ich mich an?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Registrieren Sie sich mit Ihrer E-Mail Adresse.
          </p>
        </details>

        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Was mache ich, wenn ich mein Passwort vergessen habe?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Nutzen Sie den Link „Passwort vergessen?“ auf der Login-Seite und
            folgen Sie den Anweisungen.
          </p>
        </details>

        {/* weitere Fragen später hinzufügen */}
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
            Wie gelange ich zu den Fragebögen?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Öffnen Sie im Menü den Bereich „Entscheidungen“. 
            Dort stehen Ihnen die Fragebögen zur Verfügung.
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
      </div>
    </div>
  );
}
