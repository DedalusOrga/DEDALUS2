export type ContentModule = {
  id: string;
  slug: string | null;
  title: string | null;
  body_md: string | null;
  body_md_simple: string | null;
  status: string;
  updated_at: string;
  type: string;
  file_url: string | null;
  audio_url?: string | null;
  audio_simple_url?: string | null;
  data: ContentModuleData | null;
  created_at: string;
};

export type ContentModuleData = {
  video_url?: string;
};
