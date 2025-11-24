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
        Hier finden Sie Antworten auf häufige Fragen zur Nutzung der WebApp.
        Die Inhalte sind noch im Aufbau.
      </p>

      <div className="space-y-4">
        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
            Wie melde ich mich an?
          </summary>
          <p className="mt-2 text-sm text-slate-700">
            Registrieren Sie sich mit Ihrer Email Adresse.
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
      </div>
    </div>
  );
}
