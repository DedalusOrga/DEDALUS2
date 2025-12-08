import { useNavigate, useParams } from "react-router-dom";

export default function KrebsinformationenDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Titel basierend auf slug
  const title =
    slug === "stadienuebersicht"
      ? "Stadienübersicht + Erklärung"
      : slug === "stadium-vergleich"
      ? "Stadium III vs. IV"
      : "Allgemeine Krebsinformationen";

  // Lorem-Ipsum-Texte für beide Inhalte
  const text =
    slug === "stadienuebersicht"
      ? `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec risus felis. 
Nullam sed iaculis lacus. Vestibulum eu risus eget metus hendrerit ullamcorper vitae a lorem. 
Ut tincidunt nibh ac est tempor, sed fermentum turpis sollicitudin. Nam gravida, lorem vitae 
molestie sollicitudin, dolor massa gravida sapien, vitae dictum arcu justo non libero.

Sed sed vulputate erat. Nullam dictum, purus in porta imperdiet, est mauris iaculis risus, 
eget lobortis nulla lorem sed elit. Morbi luctus justo at velit gravida, in semper neque 
accumsan. Pellentesque vel lectus non ipsum feugiat congue sit amet id odio. Donec id neque 
efficitur, pulvinar risus non, pretium justo.`
      : slug === "stadium-vergleich"
      ? `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi euismod sapien
eget nisl cursus, eget faucibus ligula laoreet. Integer pretium, mi id dictum finibus, 
massa ante aliquet nibh, in maximus ligula lorem ut odio. 

Suspendisse potenti. Curabitur auctor, ligula nec gravida dapibus, lectus metus tempus 
massa, nec laoreet justo risus ac velit. Nunc ac nisl sed erat ultricies tempus. Nulla 
facilisi. Quisque id viverra sem. Aliquam erat volutpat.

Cras pretium dapibus urna, vel porttitor nisi tempor vitae. Fusce eu urna commodo, 
luctus mauris id, interdum augue.`
      : "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

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

        {/* Weißer Content-Block */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 text-sm md:text-base leading-relaxed text-emerald-950 whitespace-pre-line">
          {text}
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
