import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl">
      {/* Zurück-Link oben */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-4 mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:underline"
      >
        <span className="text-lg">←</span>
        Zurück
      </button>

      {/* großer Bereich wie im Mock */}
      <section className="rounded-b-2xl bg-emerald-100 pt-6 pb-10">
        {/* Überschrift-Zeile */}
        <div className="px-8 md:px-12 pb-8 border-b border-emerald-50">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-snug text-emerald-900 max-w-3xl">
            Hier finden Sie einfache Erklärungen und Videos zur Nutzung der
            WebApp.
          </h1>
        </div>

        {/* Text + Video-Placeholder */}
        <div className="px-8 md:px-12 pt-8">
          <div className="grid gap-8 md:grid-cols-2 items-stretch rounded-2xl bg-white p-6 md:p-8 shadow-sm">
            <div className="text-base leading-relaxed text-slate-800">
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            {/* Video-Platzhalter – hier später echtes Video einbauen */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-video max-w-xl rounded-xl bg-slate-200 flex items-center justify-center shadow-inner">
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-white/80">
                  <div className="ml-1 w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Button zu Fragen/Antworten */}
        <div className="px-8 md:px-12 pt-10">
          <Link
            to="/fragen" // eigene Seite für Fragen/Antworten
            className="inline-flex items-center rounded-full border border-emerald-700 px-6 py-3 text-lg font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700"
          >
          Zu den Fragen/Antworten
          </Link>

        </div>
      </section>
    </div>
  );
}
