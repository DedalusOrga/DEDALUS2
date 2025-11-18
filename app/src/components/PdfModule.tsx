type Props = {
  title: string;
  fileUrl: string;
};

export default function PdfModule({ title, fileUrl }: Props) {
  if (!fileUrl) {
    return (
      <div className="p-4 bg-red-50 rounded">Keine PDF-URL vorhanden.</div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <iframe
        src={fileUrl}
        width="100%"
        height="600"
        title={title}
        className="rounded border"
      />

      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-blue-600 underline"
      >
        PDF in neuem Tab öffnen
      </a>
    </div>
  );
}
