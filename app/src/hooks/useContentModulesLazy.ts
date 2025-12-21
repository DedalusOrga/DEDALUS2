import { useCallback, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";

export function useContentModulesLazy(options: {
  type?: string;
  slug?: string;
}) {
  const { type, slug } = options;

  const [modules, setModules] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("content_modules")
      .select(
        `
        id,
        title,
        type,
        slug,
        body_md,
        body_md_simple,
        file_url,
        status,
        data
      `
      )
      .eq("status", "published");

    if (type) {
      query = query.eq("type", type);
    }
    if (slug) {
      query = query.eq("slug", slug);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading content_modules:", error);
      setError(error.message);
      setModules([]);
    } else {
      setModules(data ?? []);
      setLoadedOnce(true);
    }

    setLoading(false);
  }, [type, slug]);

  return {
    modules,
    loading,
    loadedOnce,
    error,
    loadModules,
  };
}

export default useContentModulesLazy;
