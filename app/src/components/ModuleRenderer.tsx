import TextModule from "./TextModule";
import PdfModule from "./PdfModule";
import VideoModule from "./VideoModule";

export type Module = {
  id: string;
  title: string;
  type: "text" | "pdf" | "video";
  body_md?: string | null;
  body_md_simple?: string | null;
  file_url?: string | null;
};

export default function ModuleRenderer({ module }: { module: Module }) {
  switch (module.type) {
    case "text":
      return <TextModule title={module.title} body={module.body_md ?? ""} />;

    case "pdf":
      return <PdfModule title={module.title} fileUrl={module.file_url ?? ""} />;

    case "video":
      return (
        <VideoModule title={module.title} fileUrl={module.file_url ?? ""} />
      );

    default:
      return <div>Unbekannter Modultyp: {module.type}</div>;
  }
}
