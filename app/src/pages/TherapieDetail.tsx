import { useNavigate, useParams } from "react-router-dom";

type TherapyContent = {
  title: string;
  text: string;
};

const THERAPIES: Record<string, TherapyContent> = {
  strahlentherapie: {
    title: "Strahlentherapie",
    text: "Hier stehen verständliche Informationen zur Chemotherapie. (Platzhaltertext – später mit echten Inhalten ersetzen.)",
  },
  chemotherapie: {
    title: "Chemotherapie",
    text: "Hier stehen verständliche Informationen zur Chemotherapie. (Platzhaltertext – später mit echten Inhalten ersetzen.)",
  },
  operationen: {
    title: "Operationen",
    text: "Informationen zu Operationen. (Platzhaltertext.)",
  },
  immuntherapie: {
    title: "Immuntherapie",
    text: "Informationen zur Immuntherapie. (Platzhaltertext.)",
  },
  "zielgerichtete-therapie": {
    title: "Zielgerichtete Therapie",
    text: "Informationen zur zielgerichteten Therapie. (Platzhaltertext.)",
  },
  palliativmedizin: {
    title: "Palliativmedizin",
    text: "Informationen zur Palliativmedizin. (Platzhaltertext.)",
  },
};

export default function TherapieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const therapy = slug ? THERAPIES[slug] : undefined;

  const title = therapy?.title ?? "Therapie";
  const text =
    therapy?.text ?? "Für diese Therapie sind noch keine Inhalte hinterlegt.";

  return (
    <div className="min-h-screen w-full bg-emerald-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Zurück */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-900 mb-8 hover:text-emerald-700"
        >
          <span className="text-2xl mr-2">←</span>
          Zurück
        </button>

        {/* Titel */}
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-800 mb-8">
          {title}
        </h1>

        {/* Weißer Content-Block: Text + Video-Placeholder */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 grid gap-8 md:grid-cols-2">
          {/* Text */}
          <div className="text-sm md:text-base leading-relaxed text-emerald-950 whitespace-pre-line">
            {text}
          </div>

          {/* Video-Placeholder */}
          <div className="flex items-center justify-center">
            <div className="w-full bg-emerald-100/60 aspect-video flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[10px] border-y-transparent ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons unten */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 
                       text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="mr-2 text-lg">🎤</span>
            Vorlesen
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-3 
                       text-sm md:text-base font-semibold text-white shadow-md hover:bg-emerald-900 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="mr-2 text-lg">☰</span>
            Vereinfachen
          </button>
        </div>
      </div>
    </div>
  );
}
