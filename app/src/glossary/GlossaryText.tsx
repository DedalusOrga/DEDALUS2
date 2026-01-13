import React, { useMemo } from "react";
import { useGlossary } from "./GlossaryProvider";

function stripEdges(token: string) {
  return token.replace(/^[\s"“”'‘’(]+|[\s"“”'‘’),.!?:;]+$/g, "");
}

export function GlossaryText({ text }: { text: string }) {
  const { getDefinition, openTerm } = useGlossary();
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);

  return (
    <>
      {tokens.map((t, i) => {
        if (t.trim() === "")
          return <React.Fragment key={i}>{t}</React.Fragment>;

        const cleaned = stripEdges(t);
        const def = cleaned ? getDefinition(cleaned) : null;
        if (!def) return <React.Fragment key={i}>{t}</React.Fragment>;

        return (
          <button
            key={i}
            type="button"
            onClick={() => openTerm(cleaned)}
            style={{
              all: "unset",
              cursor: "pointer",
              textDecoration: "underline",
              pointerEvents: "auto",
            }}
          >
            {t}
          </button>
        );
      })}
    </>
  );
}
