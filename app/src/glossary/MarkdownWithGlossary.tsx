import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { GlossaryRichChildren } from "./GlossaryRichChildren";

const SHOW_DEBUG = import.meta.env.DEV;

export function MarkdownWithGlossary({ text }: { text: string }) {
  return (
    <div className="relative">
      {SHOW_DEBUG && (
        <div className="absolute -top-3 right-0 z-10 text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          MarkdownWithGlossary aktiv
        </div>
      )}

      <div className="prose prose-sm max-w-none text-emerald-950">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            // Glossar nur im Fließtext anwenden
            p: ({ children }) => (
              <p>
                <GlossaryRichChildren>{children}</GlossaryRichChildren>
              </p>
            ),
            li: ({ children }) => (
              <li>
                <GlossaryRichChildren>{children}</GlossaryRichChildren>
              </li>
            ),
          }}
        >
          {text ?? ""}
        </ReactMarkdown>
      </div>
    </div>
  );
}
