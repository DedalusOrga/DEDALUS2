import React from "react";
import { GlossaryText } from "./GlossaryText";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

// Diese Tags sind "Struktur" – wenn man dort rekursiv cloneElement macht,
// entstehen bei react-markdown + sanitize + nested lists sehr oft Edgecases.
const STRUCTURE_TAGS = new Set([
  // Listen
  "ul",
  "ol",
  "li",

  // Absätze/Blöcke
  "p",
  "div",
  "section",
  "article",
  "blockquote",

  // Überschriften
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",

  // Tabellen
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",

  // Code
  "pre",
  "code",

  // Sonstiges (oft problematisch)
  "details",
  "summary",
]);

// Inline-Tags: hier ist rekursives Bearbeiten meistens sicher
const INLINE_TAGS = new Set([
  "span",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "mark",
  "small",
  "sub",
  "sup",
  "a",
  "kbd",
  "cite",
  "abbr",
]);

export function GlossaryRichChildren({
  children,
}: {
  children: React.ReactNode;
}) {
  if (children == null) return null;
  if (typeof children === "boolean") return null;

  // Text / Zahl => Glossar anwenden
  if (typeof children === "string" || typeof children === "number") {
    const s = String(children);
    return s ? <GlossaryText text={s} /> : null;
  }

  // Arrays => einzeln verarbeiten
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((c, i) => (
          <React.Fragment key={i}>
            <GlossaryRichChildren>{c}</GlossaryRichChildren>
          </React.Fragment>
        ))}
      </>
    );
  }

  // React Element
  if (React.isValidElement(children)) {
    // Fragment: nur children weiterreichen
    if (children.type === React.Fragment) {
      return (
        <>
          <GlossaryRichChildren>{children.props.children}</GlossaryRichChildren>
        </>
      );
    }

    // HTML-Tag?
    if (typeof children.type === "string") {
      const tag = children.type;

      // Void tags nicht anfassen
      if (VOID_TAGS.has(tag)) return children;

      // Struktur-Tags niemals rekursiv verändern => unverändert zurückgeben
      // (Glossar wird an anderer Stelle für deren Textteile angewendet)
      if (STRUCTURE_TAGS.has(tag)) return children;

      // Unbekannter HTML-Tag: sicherheitshalber nicht anfassen
      if (!INLINE_TAGS.has(tag)) return children;
    } else {
      // Custom Component: nicht anfassen (kann intern eigene Children-Logik haben)
      return children;
    }

    // Inline-Element => children sicher rekursiv bearbeiten
    if (children.props?.children == null) return children;

    const processed = (
      <GlossaryRichChildren>{children.props.children}</GlossaryRichChildren>
    );

    // Wichtig: cloneElement mit children als drittes Argument (stabiler)
    return React.cloneElement(children, undefined, processed);
  }

  // Fallback: alles andere ignorieren
  return null;
}
