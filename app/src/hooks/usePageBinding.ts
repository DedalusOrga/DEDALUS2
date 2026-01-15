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
        .eq("page_key", pageKey);

      if (cancelled) return;

      if (error) {
        setModuleId(null);
      } else {
        const first = (data as PageBindingRow[] | null)?.[0] ?? null;
        setModuleId(first?.module_id ?? null);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  return { moduleId, loading };
}
