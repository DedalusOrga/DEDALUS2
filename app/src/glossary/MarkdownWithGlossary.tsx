import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { GlossaryRichChildren } from "./GlossaryRichChildren";

type MarkdownWithGlossaryProps = {
  text: string;
};

function splitLiChildren(children: React.ReactNode) {
  const flat = React.Children.toArray(children);
  const textish: React.ReactNode[] = [];
  const sublists: React.ReactNode[] = [];

  for (const node of flat) {
    if (React.isValidElement(node) && typeof node.type === "string") {
      if (node.type === "ul" || node.type === "ol") {
        sublists.push(node);
        continue;
      }
    }
    textish.push(node);
  }

  return { textish, sublists };
}

export const MarkdownWithGlossary: React.FC<MarkdownWithGlossaryProps> = ({
  text,
}) => {
  return (
    <div
      className="
        prose prose-sm max-w-none text-emerald-950
        prose-ul:ml-4 prose-ol:ml-4 prose-li:my-1
        prose-ul ul:ml-4 prose-ol ol:ml-4
        prose-ul ol:ml-4 prose-ol ul:ml-4
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p>
              <GlossaryRichChildren>{children}</GlossaryRichChildren>
            </p>
          ),

          li: ({ children }) => {
            const { textish, sublists } = splitLiChildren(children);
            return (
              <li>
                {textish.length > 0 ? (
                  <GlossaryRichChildren>{textish}</GlossaryRichChildren>
                ) : null}
                {sublists.length > 0 ? <>{sublists}</> : null}
              </li>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
