import { useCallback, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";

export function useContentModulesLazy<T = unknown>(options: {
  id?: string;
  type?: string;
  slug?: string;
}) {
  const { id, type, slug } = options;

  const [modules, setModules] = useState<T[]>([]);
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
        audio_url,
        audio_simple_url,
        status,
        data
      `,
      )
      .eq("status", "published");

    if (id) {
      query = query.eq("id", id);
    }

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
      setModules((data ?? []) as T[]);
      setLoadedOnce(true);
    }

    setLoading(false);
  }, [id, type, slug]);

  const module = modules[0] ?? null;

  return {
    modules,
    module,
    loading,
    loadedOnce,
    error,
    loadModules,
  };
}

export default useContentModulesLazy;
