import { useEffect, useMemo } from "react";
import type { ContentModule } from "../types/ContentModule";
import { useContentModulesLazy } from "./useContentModulesLazy";

export function useDetailModule(type: string, slug?: string) {
  const { modules, loading, loadedOnce, loadModules } =
    useContentModulesLazy<ContentModule>({ type });

  useEffect(() => {
    if (!loadedOnce) loadModules();
  }, [loadedOnce, loadModules]);

  const module = useMemo(() => {
    const arr = modules as ContentModule[];
    return arr.find((m) => m.slug === slug);
  }, [modules, slug]);

  return { module, loading };
}
