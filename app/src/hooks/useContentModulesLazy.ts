// app/src/hooks/useContentModulesLazy.ts
import { useState } from "react";
import { supabase } from "../infrastructure/supabase/client";

type ModuleFilter = {
  type?: string; // z.B. "pdf" oder "text"
  slug?: string; // z.B. "leitfaden"
};

export function useContentModulesLazy(filter?: ModuleFilter) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  async function loadModules() {
    setLoading(true);

    let query = supabase
      .from("content_modules")
      .select("id, title, type, slug, body_md, file_url, status, data") // ← data dazu
      .eq("status", "published");

    if (filter?.type) {
      query = query.eq("type", filter.type);
    }
    if (filter?.slug) {
      query = query.eq("slug", filter.slug);
    }

    const { data, error } = await query;

    if (!error && data) {
      setModules(data);
      setLoadedOnce(true);
    }

    setLoading(false);
  }

  return { modules, loading, loadedOnce, loadModules };
}
