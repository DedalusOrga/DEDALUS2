import { useEffect, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";

type PageBindingRow = {
  module_id: string | null;
};

export function usePageBinding(pageKey: string) {
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("page_content_bindings")
        .select("module_id")
        .eq("page_key", pageKey)
        .limit(1);

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setModuleId(null);
      } else {
        const row: PageBindingRow = data[0];
        setModuleId(row.module_id ?? null);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  return { moduleId, loading };
}
