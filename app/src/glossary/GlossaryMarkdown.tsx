import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { GlossaryRichChildren } from "./GlossaryRichChildren";

export function GlossaryMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
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
  );
}
