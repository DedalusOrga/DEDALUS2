import TextModule from "./TextModule";
import VideoModule from "./VideoModule";

export type Module = {
  id: string;
  title: string;
  type: "text";
  body_md?: string | null;
  body_md_simple?: string | null;
  file_url?: string | null;
};

export default function ModuleRenderer({ module }: { module: Module }) {
  const hasFile = !!module.file_url?.trim();

  // Hauptfall: Textmodul, optional mit Video
  return (
    <div className="flex flex-col gap-6">
      {hasFile && (
        <VideoModule title={module.title} fileUrl={module.file_url ?? ""} />
      )}
      <TextModule title={module.title} body={module.body_md ?? ""} />
    </div>
  );
}
