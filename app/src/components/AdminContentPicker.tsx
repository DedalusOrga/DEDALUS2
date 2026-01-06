import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";
import { makePageKey } from "../utils/pageKey";

type ModuleOption = {
  id: string;
  title: string | null;
  slug: string | null;
  type: string | null;
  // Optional für später:
  // updated_at?: string | null;
  // created_at?: string | null;
};

export default function AdminContentPicker({
  expectedType,
}: {
  expectedType?: string;
}) {
  const location = useLocation();
  const pageKey = useMemo(
    () => makePageKey(location.pathname),
    [location.pathname]
  );

  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Suche/Sortierung
  const [query, setQuery] = useState("");

  // aktuelles Binding laden (damit Auswahl vorausgewählt ist)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("page_content_bindings")
        .select("module_id")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (!cancelled) setSelected(data?.module_id ?? "");
    })();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  // Module-Liste laden, wenn Admin-Menü geöffnet wird
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      let q = supabase
        .from("content_modules")
        .select("id,title,slug,type")
        // Für "Aktuell" später z. B.:
        // .select("id,title,slug,type,updated_at")
        .eq("status", "published")
        .order("title", { ascending: true });

      if (expectedType) q = q.eq("type", expectedType);

      const { data, error } = await q;

      if (!cancelled) {
        if (error) console.warn("load modules error", error);
        setModules(data ?? []);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, expectedType]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const list = modules
      .filter((m) => {
        const title = (m.title ?? "").toLowerCase();
        const slug = (m.slug ?? "").toLowerCase();
        return title.includes(q) || slug.includes(q);
      })
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "de"))
      .slice(0, 15);

    return list;
  }, [modules, query]);

  async function save(moduleId: string) {
    setSelected(moduleId);

    const { error } = await supabase.from("page_content_bindings").upsert(
      {
        page_key: pageKey,
        module_id: moduleId,
      },
      { onConflict: "page_key" }
    );

    if (error) {
      console.warn("upsert binding error", error);
      return;
    }

    // UX: Panel schließen & Suche leeren
    setOpen(false);
    setQuery("");

    // Gewünscht: komplette Seite neu laden
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="text-sm font-semibold text-emerald-900 hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        Admin
      </button>

      {open && (
        <>
          {loading ? (
            <span className="text-sm text-slate-600">Lade…</span>
          ) : (
            <div className="rounded-md border border-slate-300 bg-white p-2 shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titel eingeben"
                  className="w-56 rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </div>

              <div className="mt-2 text-xs text-slate-500">
                {query.trim().length < 2
                  ? "Mind. 2 Zeichen eingeben"
                  : results.length === 0
                    ? "Keine Treffer"
                    : `${results.length} Treffer`}
              </div>

              {query.trim().length >= 2 && results.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {results.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className={`w-full rounded-md px-2 py-1 text-left text-sm hover:bg-emerald-50 ${
                          selected === m.id ? "bg-emerald-100" : ""
                        }`}
                        onClick={() => save(m.id)}
                      >
                        <div className="font-medium">
                          {m.title ?? "(ohne Titel)"}
                        </div>
                        {m.slug && (
                          <div className="text-xs text-slate-500">{m.slug}</div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
