import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { makePageKey } from "../utils/pageKey";

const OVERVIEW_SLUGS = new Set([
  "allgemein",
  "nebenwirkungen",
  "optionentherapie",
  "patientenperspektive",
  "zusaetzlich",
  "unterstuetzung",
  "weiter",
]);

function splitPath(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

export function useCurrentPageEditEligibility() {
  const { pathname } = useLocation();

  const { canEdit, pageKey } = useMemo(() => {
    const segments = splitPath(pathname);

    const isQuestionnaire =
      pathname.startsWith("/entscheidungen/fragebogen") ||
      pathname.startsWith("/entscheidungen/frageboegen-entscheidung");

    const isInformationsArea = segments[0] === "informationen";

    // Detail:
    // - /informationen/<kategorie>/<detail> (>=3 Segmente)
    // - /informationen/<detail> aber nur wenn <detail> KEIN Overview-Slug ist
    const isDetailPage =
      isInformationsArea &&
      (segments.length >= 3 ||
        (segments.length === 2 && !OVERVIEW_SLUGS.has(segments[1])));

    const allowed = isDetailPage && !isQuestionnaire;

    return {
      canEdit: allowed,
      pageKey: makePageKey(pathname),
    };
  }, [pathname]);

  return { canEditCurrentPage: canEdit, pageKey, pathname };
}
