import { GlossaryText } from "../glossary/GlossaryText";

type Props = {
  title: string;
  body: string;
};

export default function TextModule({ title, body }: Props) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-800 whitespace-pre-line">
        <GlossaryText text={body} />
      </p>
    </div>
  );
}
