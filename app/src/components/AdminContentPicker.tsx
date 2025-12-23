import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";
import { makePageKey } from "../utils/pageKey";

type ModuleOption = {
  id: string;
  title: string | null;
  slug: string | null;
  type: string | null;
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

  // aktuelles Binding laden (damit Dropdown vorausgewählt ist)
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

  // Module-Liste erst laden, wenn Admin-Menü geöffnet wird
  useEffect(() => {
    if (!open || modules.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      let q = supabase
        .from("content_modules")
        .select("id,title,slug,type")
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
  }, [open, expectedType, modules.length]);

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
      // optional: UI-Toast
    }
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
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
              value={selected}
              onChange={(e) => save(e.target.value)}
            >
              <option value="">– Modul wählen –</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title ?? "(ohne Titel)"} {m.slug ? `(${m.slug})` : ""}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </div>
  );
}
