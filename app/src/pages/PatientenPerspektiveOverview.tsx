import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

type CardRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  sort_order: number;
};

export default function PatientenPerspektiveOverview() {
  const navigate = useNavigate();

  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("cards")
        .select("id,title,slug,description,status,sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.warn("load cards error", error);
        setError("Cards konnten nicht geladen werden.");
        setCards([]);
      } else {
        setCards((data ?? []) as CardRow[]);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-emerald-50 overflow-x-hidden">
      <div
        className="
          mx-auto w-full max-w-screen-xl
          px-4 sm:px-6 lg:px-8
          pt-6 sm:pt-8 lg:pt-10
          pb-10
          [padding-bottom:calc(2.5rem+env(safe-area-inset-bottom))]
        "
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-2 rounded-xl
            px-2 py-2 text-emerald-950 hover:text-emerald-800
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
          "
          aria-label="Zurück"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-base font-medium">Zurück</span>
        </button>

        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="mb-10 text-3xl font-extrabold text-emerald-900">
            Patient*innen-perspektive
          </h1>

          {loading ? (
            <div className="text-emerald-900">Lade…</div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
          ) : cards.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-slate-700 shadow-sm">
              Noch keine veröffentlichten Cards vorhanden.
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() =>
                    navigate(`/informationen/patientenperspektive/${card.slug}`)
                  }
                  className="flex h-full w-full flex-col items-start rounded-2xl bg-white p-8 text-left
                       shadow-sm transition hover:bg-emerald-50 hover:shadow-md focus:outline-none
                       focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  <span className="text-lg font-semibold text-slate-900">
                    {card.title}
                  </span>

                  {card.description && (
                    <span className="mt-2 text-sm text-slate-600">
                      {card.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
