import { GlossaryText } from "./GlossaryText";

export function GlossaryPlain({ text }: { text: string }) {
  const debug = import.meta.env.DEV;

  return (
    <>
      {debug && (
        <div className="mb-2 text-xs text-purple-700">
          [GlossaryPlain active]
        </div>
      )}
      <GlossaryText text={text} />
    </>
  );
}
