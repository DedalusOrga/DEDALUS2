export type Therapy = {
  id: string;
  slug: string;
  title: string;
  icon_path?: string | null;
  summary?: string | null;
  video_url?: string | null;
  pdf_path?: string | null;
};

export type TherapyContent = {
  therapy_id: string;
  lang: string;
  body_md: string;
  body_simple_md?: string | null;
};
