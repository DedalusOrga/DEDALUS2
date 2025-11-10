import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client"; 
import { Therapy } from "../types";

export default function InformationenOverview() {
  const [items, setItems] = useState<Therapy[] | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("therapies")
      .select("id, slug, title, summary, icon_path")
      .eq("is_published", true)
      .order("title")
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (mounted) setItems(data ?? []);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section>
      <h1 className="font-semibold text-emerald-900 text-[clamp(1.25rem,3vw,2rem)]">
        Hier finden Sie verständliche Informationen zu verschiedenen Therapien.
      </h1>

      {!items && <p className="mt-6 text-gray-600">Lade…</p>}

      <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items?.map((t) => (
          <Link
            key={t.id}
            to={`/informationen/${t.slug}`}
            className="group rounded-2xl bg-white p-4 sm:p-6 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition min-h-[9rem]"
            aria-label={`${t.title} öffnen`}
          >
            <div className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 rounded-xl bg-emerald-100 grid place-items-center">
              <span className="text-xl sm:text-2xl">🩺</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold mb-1">{t.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{t.summary}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 md:mt-10 flex justify-end">
        <Link
          to="/informationen/videos"
          className="rounded-full min-h-11 px-5 bg-emerald-800 text-white hover:bg-emerald-700 inline-flex items-center justify-center"
        >
          Zu den Videos
        </Link>
      </div>
    </section>
  );
}
