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

    // ✅ robust gegen Prefix wie /DEDALUS2/...
    const areaIndex = segments.findIndex(
      (s) => s === "informationen" || s === "entscheidungen",
    );

    if (areaIndex === -1) {
      return { canEdit: false, pageKey: makePageKey(pathname) };
    }

    const area = segments[areaIndex]; // "informationen" | "entscheidungen"
    const rest = segments.slice(areaIndex + 1);

    // ✅ Fragebogen immer ausschließen
    const isQuestionnaire =
      area === "entscheidungen" &&
      (rest[0] === "fragebogen" || rest[0] === "frageboegen-entscheidung");

    let allowed = false;

    if (area === "informationen") {
      // Detail:
      // - /informationen/<kategorie>/<detail> (rest.length >= 2)
      // - /informationen/<detail> aber nur wenn <detail> KEIN Overview-Slug ist
      const isDetailPage =
        rest.length >= 2 || (rest.length === 1 && !OVERVIEW_SLUGS.has(rest[0]));

      allowed = isDetailPage && !isQuestionnaire;
    }

    if (area === "entscheidungen") {
      // ✅ Entscheidung-Detailseiten sollen editierbar sein:
      // z.B. /entscheidungen/arztgespraech/checkliste
      const isDecisionDetail = rest.length >= 2;
      allowed = isDecisionDetail && !isQuestionnaire;
    }

    return {
      canEdit: allowed,
      pageKey: makePageKey(pathname),
    };
  }, [pathname]);

  return { canEditCurrentPage: canEdit, pageKey, pathname };
}
