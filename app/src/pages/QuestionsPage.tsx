/**
 * Fragen & Antworten – FAQ Seite
 *
 * Hinweis:
 * - Inhalte sind aktuell statisch (hard-coded)
 * - Das Team möchte später evtl. dynamische FAQs (z. B. aus Supabase oder JSON)
 * - Dieser Aufbau dient als Startversion / Platzhalter
 */

export default function QuestionsPage() {
  // TODO: später dynamisch (z. B. aus Supabase / ContentModule wie TherapieDetail)
  // Wenn du Supabase Storage public nutzt, ist das typischerweise die public URL.
  const videoUrl =
    "https://grnnngcaorajlmceadks.supabase.co/storage/v1/object/sign/videos/BenutzerHilfe.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZjFlNDFkOS0yN2FiLTQ4NzUtOGE0NC0xMjNmZWY1OGE5MzAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvQmVudXR6ZXJIaWxmZS5tcDQiLCJpYXQiOjE3NjkzNzkxMTUsImV4cCI6MjA4NDczOTExNX0.RBROEwxn-eCvlU54fHkT5lRlAAv0NPzC5U_ZYBbgYSQ";
  const hasVideo = !!videoUrl;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <h1 className="text-3xl font-extrabold text-emerald-900">
        Häufige Fragen und Antworten
      </h1>

      <p className="text-base text-slate-800">
        Hier finden Sie Antworten auf häufige Fragen zur Nutzung der WebApp. Die
        Inhalte sind noch im Aufbau.
      </p>

      {/* 2-Spalten Layout: links FAQ, rechts Video */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Links: FAQ */}
        <div className="space-y-4 lg:col-span-2">
          <details className="rounded-xl bg-white p-4 shadow-sm">
            <summary className="cursor-pointer text-lg font-semibold text-emerald-800">
              Wie kann ich mich schneller orientieren?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              Nutzen Sie die Hauptnavigation oben auf der Seite. Die Inhalte
              sind thematisch in die Bereiche „Informationen“ und
              „Entscheidungen“ gegliedert.
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
              Sie Fragen für das Arztgespräch, Entscheidungshilfen und
              Fragebögen.
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

        {/* Rechts: Video (Look wie TherapieDetail) */}
        <aside className="lg:col-span-1">
          {hasVideo && (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-emerald-900">
                Video-Anleitung
              </h2>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-3xl shadow-sm"
              />
              <p className="mt-3 text-sm text-slate-700">
                Kurze Erklärung zur Nutzung der WebApp.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
