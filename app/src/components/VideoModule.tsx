type Props = {
  title: string;
  fileUrl: string;
};

export default function VideoModule({ title, fileUrl }: Props) {
  if (!fileUrl) {
    return (
      <div className="p-4 bg-red-50 rounded">Keine Video-URL vorhanden.</div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <video src={fileUrl} controls className="w-full rounded-lg border">
        Dein Browser unterstützt das Video-Element nicht.
      </video>

      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-blue-600 underline"
      >
        Video in neuem Tab öffnen
      </a>
    </div>
  );
}
