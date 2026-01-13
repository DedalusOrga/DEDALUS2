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

export function GlossaryRichChildren({
  children,
}: {
  children: React.ReactNode;
}) {
  if (children == null) return null;

  // Text -> Glossar anwenden
  if (typeof children === "string" || typeof children === "number") {
    return <GlossaryText text={String(children)} />;
  }

  // Array -> rekursiv
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, i) => (
          <GlossaryRichChildren key={i}>{child}</GlossaryRichChildren>
        ))}
      </>
    );
  }

  // React-Element -> void tags NICHT anfassen
  if (React.isValidElement(children)) {
    const type = children.type;

    // Wenn es ein HTML-Tag ist (type ist string) und void -> unverändert zurück
    if (typeof type === "string" && VOID_TAGS.has(type)) {
      return children;
    }

    // Wenn es eh keine children hat -> auch unverändert
    if (children.props?.children == null) {
      return children;
    }

    // Sonst clonen und Kinder rekursiv bearbeiten
    return React.cloneElement(children, {
      ...children.props,
      children: (
        <GlossaryRichChildren>{children.props.children}</GlossaryRichChildren>
      ),
    });
  }

  return null;
}
