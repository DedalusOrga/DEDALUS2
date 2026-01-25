import { useEffect, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";

type PageBindingUpdatedEvent = CustomEvent<{ pageKey?: string }>;

export function usePageBinding(pageKey: string) {
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Trigger, um das Binding neu zu laden (ohne pageKey-Wechsel)
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("page_content_bindings")
        .select("module_id")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (!cancelled) {
        setModuleId(error ? null : (data?.module_id ?? null));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageKey, refreshTick]);

  // Lauscht auf "page-binding-updated" und triggert ein Re-Fetch
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as PageBindingUpdatedEvent;
      if (!ev.detail?.pageKey) return;

      // nur reagieren, wenn es diese Seite betrifft
      if (ev.detail.pageKey === pageKey) {
        setRefreshTick((t) => t + 1);
      }
    };

    window.addEventListener("page-binding-updated", handler);
    return () => window.removeEventListener("page-binding-updated", handler);
  }, [pageKey]);

  return { moduleId, loading };
}
