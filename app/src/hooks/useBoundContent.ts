import { useEffect } from "react";
import { usePageBinding } from "./usePageBinding";
import { useContentModulesLazy } from "./useContentModulesLazy";
import type { ContentModule } from "../types/ContentModule";

export function useBoundContent<T = ContentModule>(pageKey: string) {
  const { moduleId, loading: bindingLoading } = usePageBinding(pageKey);

  // WICHTIG: id wird hier als Option übergeben
  const { module, loading, loadModules, error } = useContentModulesLazy<T>({
    id: moduleId ?? undefined,
  });

  // WICHTIG: Lazy triggern, sobald moduleId vorhanden/neu ist
  useEffect(() => {
    if (moduleId) {
      loadModules();
    }
  }, [moduleId, loadModules]);

  return {
    module,
    loading: bindingLoading || loading,
    error,
    moduleId,
  };
}
