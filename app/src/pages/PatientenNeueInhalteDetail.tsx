import { MarkdownWithGlossary } from "../glossary/MarkdownWithGlossary";

export default function PatientenNeueInhalteDetail() {
  const text = `
## Informationen zu neuen Inhalten

Hier werden begleitende Texte zu den Videos angezeigt.
`;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-emerald-900">
        Neue Videos
      </h1>

      {/* Videos */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <div className="flex h-40 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
          Video
        </div>
        <div className="flex h-40 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
          Video
        </div>
      </div>

      {/* Text */}
      <MarkdownWithGlossary text={text} />
    </div>
  );
}
