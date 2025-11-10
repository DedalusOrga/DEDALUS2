import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client"; 
import { Therapy, TherapyContent } from "../types";
import ReactMarkdown from "react-markdown";

export default function TherapieDetail() {
  const { slug } = useParams();
  const [therapy, setTherapy] = useState<Therapy | null>(null);
  const [content, setContent] = useState<TherapyContent | null>(null);
  const [simple, setSimple] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: t } = await supabase
        .from("therapies")
        .select("id, title, video_url, pdf_path")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (!mounted || !t) return;
      setTherapy(t);

      const { data: c } = await supabase
        .from("therapy_content")
        .select("therapy_id, lang, body_md, body_simple_md")
        .eq("therapy_id", t.id)
        .eq("lang", "de")
        .single();
      if (!mounted) return;
      setContent(c ?? null);
    })();
    return () => { mounted = false; synthRef.current?.cancel(); };
  }, [slug]);

  const mdForSpeech = useMemo(() => {
    const md = simple ? content?.body_simple_md ?? content?.body_md : content?.body_md;
    return md?.replace(/[#>*_`]/g, "") ?? "";
  }, [content, simple]);

  function handleSpeak() {
    const synth = synthRef.current;
    synth?.cancel();
    if (!mdForSpeech) return;
    const u = new SpeechSynthesisUtterance(mdForSpeech);
    u.lang = "de-DE";
    synth?.speak(u);
  }

  if (!therapy || !content) {
    return <p>Lade…</p>;
  }

  const displayMd = (simple && content.body_simple_md) ? content.body_simple_md : content.body_md;

  return (
    <section>
      <Link to="/informationen" className="text-sm md:text-base text-gray-600 hover:underline">← Zurück</Link>
      <h1 className="mt-4 md:mt-6 text-[clamp(1.5rem,3vw,2rem)] font-semibold text-emerald-900">
        {therapy.title}
      </h1>

      <div className="mt-5 md:mt-6 grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 md:gap-8 items-start">
        <article className="prose prose-sm md:prose max-w-none">
          <ReactMarkdown>{displayMd}</ReactMarkdown>

          {therapy.pdf_path && (
            <a
              href={publicPdfUrl(therapy.pdf_path)}
              className="inline-flex items-center gap-2 rounded-full min-h-11 px-4 bg-emerald-800 text-white mt-4"
              target="_blank" rel="noreferrer"
            >
              PDF öffnen
            </a>
          )}
        </article>

        <aside className="bg-white rounded-2xl shadow p-3 sm:p-4">
          {therapy.video_url ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100">
              <iframe
                title={`${therapy.title} Video`}
                src={toEmbedUrl(therapy.video_url)}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl bg-gray-100 grid place-items-center text-gray-500">
              Kein Video vorhanden
            </div>
          )}

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSpeak}
              className="rounded-full min-h-11 px-4 bg-emerald-800 text-white inline-flex items-center justify-center"
            >
              🔊 Vorlesen
            </button>
            <button
              onClick={() => setSimple(v => !v)}
              className="rounded-full min-h-11 px-4 bg-emerald-100 text-emerald-900 inline-flex items-center justify-center"
              aria-pressed={simple}
            >
              🧩 {simple ? "Standard" : "Vereinfachen"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function publicPdfUrl(path: string) {
  // passt für PUBLIC Buckets. Bei privaten: signed URL generieren.
  const base = import.meta.env.VITE_SUPABASE_URL!.replace(/\/storage\/v1.*/, "");
  return `${base}/storage/v1/object/public/${path}`;
}

function toEmbedUrl(url?: string | null) {
  if (!url) return "";
  const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/;
  const m = url.match(yt);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url; // z. B. Vimeo Embed bereits vollständig
}
