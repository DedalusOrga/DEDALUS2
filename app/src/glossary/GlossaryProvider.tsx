import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../infrastructure/supabase/client";

type GlossaryContextValue = {
  isLoading: boolean;
  getDefinition: (term: string) => string | null;
  openTerm: (term: string) => void;
};

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

function normalize(term: string) {
  return term.trim().toLowerCase();
}

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<Map<string, string>>(new Map());

  // global modal state
  const [open, setOpen] = useState(false);
  const [activeTerm, setActiveTerm] = useState("");
  const [activeDef, setActiveDef] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGlossary() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("term, definition");
      if (cancelled) return;

      if (error) {
        console.error("Glossary load failed:", error);
        setMap(new Map());
        setIsLoading(false);
        return;
      }

      const next = new Map<string, string>();
      for (const row of data ?? [])
        next.set(normalize(row.term), row.definition);

      setMap(next);
      setIsLoading(false);
    }

    loadGlossary();
    return () => {
      cancelled = true;
    };
  }, []);

  function openTerm(term: string) {
    const def = map.get(normalize(term)) ?? null;
    if (!def) return;
    setActiveTerm(term);
    setActiveDef(def);
    setOpen(true);
  }

  const value = useMemo<GlossaryContextValue>(
    () => ({
      isLoading,
      getDefinition: (term: string) => map.get(normalize(term)) ?? null,
      openTerm,
    }),
    [isLoading, map]
  );

  return (
    <GlossaryContext.Provider value={value}>
      {children}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(600px, 92vw)",
              background: "white",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>{activeTerm}</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <p style={{ marginTop: 12, marginBottom: 0 }}>{activeDef}</p>
          </div>
        </div>
      )}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  const ctx = useContext(GlossaryContext);
  if (!ctx)
    throw new Error("useGlossary must be used within <GlossaryProvider>");
  return ctx;
}
