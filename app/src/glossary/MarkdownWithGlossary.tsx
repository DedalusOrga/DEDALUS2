import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { GlossaryRichChildren } from "./GlossaryRichChildren";

export function MarkdownWithGlossary({ text }: { text: string }) {
  return (
    <div className="prose max-w-none text-emerald-950">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Glossar nur im Fließtext anwenden:
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
        {text}
      </ReactMarkdown>
    </div>
  );
}
