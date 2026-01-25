import { useNavigate } from "react-router-dom";
import StageIcon from "../../assets/icons/book.svg"; // später austauschen
import CompareIcon from "../../assets/icons/book.svg"; // später austauschen

export default function KrebsinformationenOverview() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "stadien",
      title: "Stadienübersicht + Erklärung",
      icon: StageIcon,
      slug: "stadienuebersicht",
    },
    {
      id: "vergleich",
      title: "Stadium III vs. IV",
      icon: CompareIcon,
      slug: "stadium-vergleich",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-emerald-50 overflow-x-hidden">
      <div
        className="
          mx-auto w-full max-w-screen-xl
          px-4 sm:px-6 lg:px-8
          pt-6 sm:pt-8 lg:pt-10
          pb-10
          [padding-bottom:calc(2.5rem+env(safe-area-inset-bottom))]
        "
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-2 rounded-xl
            px-2 py-2 text-emerald-950 hover:text-emerald-800
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
          "
          aria-label="Zurück"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-base font-medium">Zurück</span>
        </button>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-3xl font-extrabold text-emerald-900 mb-8">
            Allgemeine Krebsinformationen
          </h1>

          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() =>
                  navigate(`/informationen/allgemein/${card.slug}`)
                }
                className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-sm
                       hover:bg-emerald-50 hover:shadow-md transition"
              >
                <img src={card.icon} className="h-10 w-10 mb-4" />
                <span className="text-lg font-semibold text-slate-900 leading-snug">
                  {card.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
