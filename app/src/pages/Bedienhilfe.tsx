import { Link, useNavigate } from "react-router-dom";

export default function Bedienhilfe(){

    const navigate = useNavigate();

      return (
        <div className="mx-auto max-w-6xl">
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
                    Das Video-Tutorial gibt Ihnen einen ersten Überblick und hilft Ihnen dabei, sich in der WebApp zurechtzufinden und 
                    die wichtigsten Funktionen zu nutzen.
                  </p>
                  <p>
                    Sie erfahren, wie Sie Informationen zu verschiedenen Therapien sowie weitere Inhalte finden und 
                    wie Sie Unterstützung bei der Entscheidungsfindung erhalten, einschließlich der Nutzung von Fragebögen.
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
    
            {/* Button zu Fragen/Antworten + Admin-Button */}
            <div className="px-8 md:px-12 pt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <Link
                to="/bedienhilfe/fragen"
                className="inline-flex items-center rounded-full border border-emerald-700 px-6 py-3 text-lg font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700"
              >
                Zu den Fragen/Antworten
              </Link>

            </div>
          </section>
        </div>
      );

}